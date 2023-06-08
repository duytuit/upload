import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { join } from 'path';
import * as fs from 'fs';
import * as MIMEType from 'whatwg-mimetype';
import * as moment from 'moment';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
export function storage(uploadPath) {
  return multer.diskStorage({
    destination: async (req, file, cd) => {
      const currentDate = moment().format('YYYY-MM-DD');
      let path = '';
      if (uploadPath) {
        path = uploadPath + '/' + currentDate;
      } else {
        path = `public/upload/${currentDate}`;
      }
      try {
        await fs.promises.stat(path);
      } catch (error) {
        await fs.promises.mkdir(path, { recursive: true });
      }
      req.query.fileName = '/upload/' + currentDate;
      cd(null, path);
    },
    filename: async (req, file, cd) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      let originalname = file.originalname;
      if (file.originalname.lastIndexOf('.') < 0) {
        const mimeType = new MIMEType(file.mimetype);
        const subtype = mimeType.subtype;
        originalname = file.originalname + '.' + subtype;
      }
      req.query.fileName =
        req.query.fileName + '/' + uniqueSuffix + '-' + originalname;
      cd(null, uniqueSuffix + '-' + originalname);
    },
  });
}

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          storage: storage(configService.get('uploadPath')),
          preservePath: false,
        };
      },
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      serveStaticOptions: {
        setHeaders: (res) => {
          res.set('Cache-Control', 'max-age=2592000');
        },
      },
    }),
  ],
  controllers: [AppController],
  providers: [
    MulterModule,
    //Bộ lọc toàn cầu
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
