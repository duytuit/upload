import {
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AjaxResult } from './common/class/ajax-result.class';

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
      fileName,
      originalname: file.originalname,
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
}
