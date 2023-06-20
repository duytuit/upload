/*
 * @Author: Duytuit
 * @Date: 2021-12-08 19:31:36
 * @LastEditTime: 2022-09-18 11:07:34
 * @LastEditors: Please set LastEditors
 * @Description: Trình đánh chặn lỗi toàn cầu
 * @FilePath: src/common/filters/all-exception.filter.ts
 * You can you up，no can no bb！！
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AjaxResult } from '../class/ajax-result.class';
import { ApiException } from '../exceptions/api.exception';
import { LogDebug } from '../helper/debugLog';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const { status, result } = this.errorResult(exception);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.status(status).json(result);
    LogDebug._info(exception.stack);
  }

  /* Phân tích loại lỗi, được lấy Trạng thái Mã và giá trị trả về */
  errorResult(exception: unknown) {
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const code =
      exception instanceof ApiException
        ? (exception as ApiException).getErrCode()
        : status;

    let message: string;
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      message = (response as any).message ?? response;
    } else {
      message = `${exception}`;
    }
    return {
      status,
      result: AjaxResult.error(message, code),
    };
  }
}
