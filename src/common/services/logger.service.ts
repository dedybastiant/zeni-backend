import * as fs from 'fs';
import path from 'path';
import { ConsoleLogger, Injectable } from '@nestjs/common';

@Injectable()
export class LoggerService extends ConsoleLogger {
  private logDir = path.join(process.cwd(), 'src', 'log');
  private logFile = path.join(this.logDir, 'app.log');

  private saveToFile(level: string, message: string, context?: string) {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    const log = `[${new Date().toISOString()}] [${level}]${context ? ` [${context}]` : ''} ${message}\n`;
    fs.appendFileSync(this.logFile, log);
  }

  log(message: string, context?: string) {
    super.log(message, context);
    this.saveToFile('LOG', message, context);
  }

  error(message: string, stack?: string, context?: string) {
    super.error(message, stack, context);
    this.saveToFile('ERROR', message, context);
  }

  warn(message: string, context?: string) {
    super.warn(message, context);
    this.saveToFile('WARN', message, context);
  }
}
