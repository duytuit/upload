import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogDebug } from './common/helper/debugLog';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log('http://127.0.0.1:3000/');
  LogDebug._info('sdfsdfdsfdsfd');
  console.log('-----------------------');
}
bootstrap();
