import { green, red, yellow } from 'chalk';
type Log = {
  msg: string;
  fileName: string;
};

interface ILogger {
  log(msg: string, fileName?: string): void;
  info(msg: string, fileName?: string): void;
  error(msg: string, fileName: string): void;
}

class LoggerClass implements ILogger {
  private __log(type: 'error' | 'log' | 'info' | 'warning', log: Log) {
    const FILE_NAME = log.fileName
      .split(/\\/g)
      .pop()
      .replace(/\.ts|\.js/g, '');
    const MSG = log.msg.trim();
    const message = `[${FILE_NAME}] \t${MSG}`;
    switch (type) {
      case 'log':
        console.log(green(message));
        break;
      case 'info':
        console.log(green(message));
        break;
      case 'error':
        console.log(red(message));
        break;
      case 'warning':
        console.log(yellow(message));
        break;
    }
  }

  /**
   * For Error
   * @param msg
   * @param stack
   */
  public log(msg: string, fileName?: string): void {
    this.__log('log', { msg, fileName });
  }
  /**
   * For Info
   * @param msg
   * @param fileName
   */
  public info(msg: string, fileName?: string): void {
    this.__log('info', { msg, fileName });
  }
  /**
   * For Message
   * @param msg
   * @param fileName
   */
  public error(msg: string, fileName: string): void {
    this.__log('error', { msg, fileName });
  }
}

export const Logger = new LoggerClass();
