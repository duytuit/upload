import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LogDebug } from './common/helper/debugLog';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(8090);
  console.log('http://127.0.0.1:3000/');
  LogDebug._info('sdfsdfdsfdsfd');
  console.log('-----------------------');
}
bootstrap();
