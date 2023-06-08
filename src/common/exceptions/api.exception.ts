/*
 * @Author: Duytuit
 * @Date: 2021-12-08 19:28:34
 * @LastEditTime: 2022-09-18 11:07:37
 * @LastEditors: Please set LastEditors
 * @Description: Tùy chỉnh bất thường
 * @FilePath: src/common/exceptions/api.exception.ts
 * You can you up，no can no bb！！
 */
import { HttpException } from '@nestjs/common';

export class ApiException extends HttpException {
  private errCode: number;
  constructor(msg: string, errCode?: number) {
    //Các vấn đề vĩnh viễn đều được sử dụng401Mã lỗi
    if (errCode && errCode == 401) {
      super(msg, 200);
      this.errCode = 401;
    } else {
      //Tất cả các bất thường khác được sử dụng500Mã lỗi
      super(msg, errCode ?? 200);
      this.errCode = errCode ?? 500;
    }
  }
  getErrCode(): number {
    return this.errCode;
  }
}
