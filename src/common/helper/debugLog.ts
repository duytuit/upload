import axios from 'axios';

export class LogDebug {
  static _info(data?: any, req?: any) {
    return new Promise((resolve) => {
      try {
        let msg = 'Message: ' + data;
        msg += '\nLink: ' + 'https://t.me/%2bVTL1UvQHQmVkZjM1';
        msg += '\n\nDesc: ';
        msg += '\nLink chat: ' + 'http://103.143.209.74:8080/';
        msg +=
          '\nHost: ' +
          (
            (req.headers['x-forwarded-for'] as string) ||
            req.socket.remoteAddress ||
            ''
          ).replace('::ffff:', '');
        const res = encodeURI(msg);
        axios.get(
          'https://api.telegram.org/bot6099582942:AAFOS3MT5V10dTAMVRKnXz3v4_ctrbioJJk/sendmessage?chat_id=-949648605&text=' +
            res,
        );
      } catch (error) {
        console.error(error);
      }
    });
  }

  static _error(data?: any) {
    return new Promise((resolve) => {
      try {
        let msg = 'Message: ' + data;
        msg += '\nLink: ' + 'https://t.me/%2bVTL1UvQHQmVkZjM1';
        msg += '\n\nDesc: ';
        msg += '\nLink chat: ' + 'http://103.143.209.74:8080/';
        const res = encodeURI(msg);
        axios.get(
          'https://api.telegram.org/bot6099582942:AAFOS3MT5V10dTAMVRKnXz3v4_ctrbioJJk/sendmessage?chat_id=-949648605&text=' +
            res,
        );
      } catch (error) {
        console.error(error);
      }
    });
  }
  static get_url_extension(url) {
    return url.split(/[#?]/)[0].split('.').pop().trim();
  }
}
