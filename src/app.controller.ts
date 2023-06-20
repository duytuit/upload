import {
  Controller,
  Get,
  Param,
  Post,
  Query,
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
  @Get('common/upload/path')
  async uploadFileFromUrl(@Query() param) {
    const currentDate = moment_3().format('YYYY-MM-DD');
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
  async uploadFileFromBuffer(@Query() param) {
    const currentDate = moment_3().format('YYYY-MM-DD');
    const path = `public/upload/${currentDate}`;
    try {
      await fs.promises.stat(path);
    } catch (error) {
      await fs.promises.mkdir(path, { recursive: true });
    }
    const fileUrl = param.buffer;
    const filename = param.file_name.substring(
      param.file_name.lastIndexOf('/') + 1,
    );
    const downloadPath = `public/upload/${currentDate}/${filename}`;
    const ext = LogDebug.get_url_extension(filename);
    return new Promise((resolve, reject) => {
      fs.mkdirSync(path);
      const outStream = fs.createWriteStream(downloadPath);
      outStream.write(param.buffer);
      outStream.end();
      outStream.on('finish', () => {
        resolve({
          status: true,
          path: `/upload/${currentDate}/${filename}`,
          filename: filename,
          ext: ext,
        });
      });
    });
  }
  @Get('common/upload/redirect')
  async uploadFileFromUrlRedirect(@Query() param, @Res() res) {
    const currentDate = moment_3().format('YYYY-MM-DD');
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
    const filename = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
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
}
