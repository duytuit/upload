import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AjaxResult } from './common/class/ajax-result.class';
import * as fs from 'fs';
import * as http from 'http';
import * as https from 'https';
import * as moment_3 from 'moment';
import { LogDebug } from './common/helper/debugLog';
import * as moment from 'moment';
import * as sharp_1 from 'sharp';
import axios from 'axios';
const path_thegioiso =
  '/Users/duytu/Downloads/infinite-v4.2.1/cms_blog/uploads/images/';
@Controller()
export class AppController {
  @Get()
  index() {
    return 'xin chào!';
  }
  /* Tải lên tệp đơn */
  @Post('common/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50000000 }, //50MB
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('fileName') fileName,
  ) {
    return AjaxResult.success({
      path: file.path,
      filename: file.filename,
      mimetype: file.mimetype,
    });
  }

  /* Tải lên tệp tải lên */
  @Post('common/uploads')
  @UseInterceptors(
    FilesInterceptor('files', 3, {
      limits: { fileSize: 50000000 }, //50MB
    }),
  )
  async uploadFils(@UploadedFiles() files: Array<Express.Multer.File>) {
    /* Không xử lý */
    return AjaxResult.success(files);
  }
  @Get('v2/common/upload/path')
  async uploadFileFromUrl_v2(@Query() param) {
    console.log(path_thegioiso);
    
    const currentDate = param.folder
      ? param.folder
      : moment_3().format('YYYYMM');
    const path = `${path_thegioiso + currentDate}`;
    const path_1 = `public/upload/${currentDate}`;
    try {
      await fs.promises.stat(path);
      await fs.promises.stat(path_1);
    } catch (error) {
      await fs.promises.mkdir(path, { recursive: true });
      await fs.promises.mkdir(path_1, { recursive: true });
    }
    const result = await this.handleUploadFile_v2(param, currentDate);
    if (result.status == true) {
      delete result.status;
      return AjaxResult.success(result);
    } else {
      delete result.status;
      return AjaxResult.error(result);
    }
  }
  @Get('common/upload/path')
  async uploadFileFromUrl(@Query() param) {
    const currentDate = param.folder
      ? param.folder
      : moment_3().format('YYYY-MM-DD');
    const path = `public/upload/${currentDate}`;
    try {
      await fs.promises.stat(path);
    } catch (error) {
      await fs.promises.mkdir(path, { recursive: true });
    }
    const result = await this.handleUploadFile(param, currentDate);
    if (result.status == true) {
      delete result.status;
      return AjaxResult.success(result);
    } else {
      delete result.status;
      return AjaxResult.error(result);
    }
  }
  @Post('common/upload/buffer')
  async uploadFileFromBuffer(@Body() param, @Query() query) {
    const currentDate = query.folder
      ? query.folder
      : moment_3().format('YYYY-MM-DD');
    const path = `public/upload/${currentDate}`;
    try {
      await fs.promises.stat(path);
    } catch (error) {
      await fs.promises.mkdir(path, { recursive: true });
    }
    const result = await this.handleUploadFileByBuffer(param, currentDate);
    if (result.status == true) {
      delete result.status;
      return AjaxResult.success(result);
    } else {
      delete result.status;
      return AjaxResult.error(result);
    }
  }
  @Get('common/upload/redirect')
  async uploadFileFromUrlRedirect(@Query() param, @Res() res) {
    const currentDate = param.folder
      ? param.folder
      : moment_3().format('YYYY-MM-DD');
    const path = `public/upload/${currentDate}`;
    try {
      await fs.promises.stat(path);
    } catch (error) {
      await fs.promises.mkdir(path, { recursive: true });
    }
    const result = await this.handleUploadFile(param, currentDate);
    if (result.status == true) {
      delete result.status;
      return res.redirect(result.path);
    } else {
      delete result.status;
      return AjaxResult.error(result);
    }
  }
  @Get('common/remove/file?:path')
  async removeFilePath(@Query('path') path) {
    if (fs.existsSync(`./public/${path}`)) {
      console.log(path);
      fs.unlink(`./public/${path}`, (error) => {
        if (error) {
          return AjaxResult.error('Xóa thất bại.');
        } else {
          console.log('Xóa thành công.');
        }
      });
      return AjaxResult.success('Xóa thành công.');
    } else {
      return AjaxResult.error('Không tìm thấy đường dẫn.');
    }
  }
  private handleUploadFile(param, currentDate): Promise<any> {
    const fileUrl = param.fileUrl;
    const filename = param.gettime
      ? moment().format('YYYYMMDD_HHmmss') +
        '_' +
        fileUrl.substring(fileUrl.lastIndexOf('/') + 1)
      : fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
    const downloadPath = `public/upload/${currentDate}/${filename}`;
    const ext = LogDebug.get_url_extension(fileUrl);
    // Choose the appropriate module based on the URL protocol
    const downloader = fileUrl.startsWith('https') ? https : http;
    return new Promise((resolve, reject) => {
      downloader
        .get(fileUrl, (response) => {
          if (response.statusCode !== 200) {
            console.error(
              `Failed to download file. Status Code: ${response.statusCode}`,
            );
            return;
          }

          // Create a writable stream and pipe the response into it
          const fileStream = fs.createWriteStream(downloadPath);
          response.pipe(fileStream);

          // Event handler for when the file download is complete
          fileStream.on('finish', () => {
            console.log('File download complete.');
            resolve({
              status: true,
              path: `/upload/${currentDate}/${filename}`,
              filename: filename,
              ext: ext,
            });
          });

          // Event handler for any errors during the download
          fileStream.on('error', (err) => {
            console.error('Error during file download:', err);
            reject({
              status: false,
              path: '',
            });
          });
        })
        .on('error', (err) => {
          console.error('Error while downloading file:', err);
          reject({
            status: false,
            path: '',
          });
        });
    });
  }
  private handleUploadFileByBuffer(param, currentDate): Promise<any> {
    const filename = param.gettime
      ? moment().format('YYYYMMDD_HHmmss') +
        '_' +
        param.file_name.substring(param.file_name.lastIndexOf('/') + 1)
      : param.file_name.substring(param.file_name.lastIndexOf('/') + 1);
    const downloadPath = `public/upload/${currentDate}/${filename}`;
    const ext = LogDebug.get_url_extension(filename);
    return new Promise((resolve, reject) => {
      const outStream = fs.createWriteStream(downloadPath);
      const buff = Buffer.from(param.buffer, 'utf-8');
      outStream.write(buff);
      outStream.end();
      outStream.on('finish', () => {
        resolve({
          status: true,
          path: `/upload/${currentDate}/${filename}`,
          filename: filename,
          ext: ext,
        });
      });
      outStream.on('error', (err) => {
        console.error('Error while downloading file:', err);
        reject({
          status: false,
          path: '',
        });
      });
    });
  }
  private async handleUploadFile_v2(param, currentDate): Promise<any> {
    const fileUrl = param.fileUrl;
    const _filename = moment().format('YYYYMMDD_HHmmss');
    const filename = param.gettime
      ? _filename + '_' + fileUrl.substring(fileUrl.lastIndexOf('/') + 1)
      : fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
    const downloadPath = `public/upload/${currentDate}/${filename}`;
    const ext = LogDebug.get_url_extension(filename);
    if (ext === 'gif') {
      // Choose the appropriate module based on the URL protocol
      const downloader = fileUrl.startsWith('https') ? https : http;
      return new Promise((resolve, reject) => {
        downloader
          .get(fileUrl, (response) => {
            if (response.statusCode !== 200) {
              console.error(
                `Failed to download file. Status Code: ${response.statusCode}`,
              );
              return;
            }

            // Create a writable stream and pipe the response into it
            const fileStream = fs.createWriteStream(downloadPath);
            response.pipe(fileStream);

            // Event handler for when the file download is complete
            fileStream.on('finish', () => {
              console.log('File download complete.');
              resolve({
                status: true,
                path: `/upload/${currentDate}/${filename}`,
                filename: filename,
                ext: ext,
              });
            });

            // Event handler for any errors during the download
            fileStream.on('error', (err) => {
              console.error('Error during file download:', err);
              reject({
                status: false,
                path: '',
              });
            });
          })
          .on('error', (err) => {
            console.error('Error while downloading file:', err);
            reject({
              status: false,
              path: '',
            });
          });
      });
    } else {
      const input = (await axios({ url: fileUrl, responseType: 'arraybuffer' }))
        .data as Buffer;
      const image_750x_ = await sharp_1(input)
        .resize(750)
        // .jpeg({ mozjpeg: true })
        .toFile(`${path_thegioiso + currentDate}/image_750x_${filename}`);
      const image_750x415 = await sharp_1(input)
        .resize(750, 415, {
          fit: 'inside',
        })
        // .jpeg({ mozjpeg: true })
        .toFile(`${path_thegioiso + currentDate}/image_750x415_${filename}`);
      const image_100x75_ = await sharp_1(input)
        .resize(100, 75, {
          fit: 'inside',
        })
        // .jpeg({ mozjpeg: true })
        .toFile(`${path_thegioiso + currentDate}/image_100x75_${filename}`);
      const image_650x433_ = await sharp_1(input)
        .resize(650, 433, {
          fit: 'inside',
        })
        // .jpeg({ mozjpeg: true })
        .toFile(`${path_thegioiso + currentDate}/image_650x433_${filename}`);
      return {
        status: true,
        image_big: `uploads/images/${currentDate}/image_750x_${filename}`,
        image_mid: `uploads/images/${currentDate}/image_750x415_${filename}`,
        image_small: `uploads/images/${currentDate}/image_100x75_${filename}`,
        image_slider: `uploads/images/${currentDate}/image_650x433_${filename}`,
        filename: filename,
        ext: ext,
      };
    }
  }
}
