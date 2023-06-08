import {
  Controller,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AjaxResult } from './common/class/ajax-result.class';

@Controller('common')
export class AppController {
  /* Tải lên tệp đơn */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file',{
    limits: {fileSize: 50000000}, //50MB
}))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('fileName') fileName,
  ) {
    return AjaxResult.success({
      fileName,
      originalname: file.originalname,
      mimetype: file.mimetype,
    });
  }

  /* Tải lên tệp tải lên */
  @Post('uploads')
  @UseInterceptors(FilesInterceptor('files',3,{
    limits: {fileSize: 50000000}, //50MB
  }))
  async uploadFils(@UploadedFiles() files: Array<Express.Multer.File>) {
    /* Không xử lý */
    return AjaxResult.success(files);
  }
}
