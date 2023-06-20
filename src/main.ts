import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogDebug } from './common/helper/debugLog';
import { json } from 'stream/consumers';
import { urlencoded } from 'express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  await app.listen(8090);
  console.log('http://127.0.0.1:3000/');
  LogDebug._info('sdfsdfdsfdsfd');
  console.log('-----------------------');
}
bootstrap();
