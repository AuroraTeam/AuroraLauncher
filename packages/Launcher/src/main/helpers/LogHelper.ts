/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { appendFileSync } from 'fs';
import { format } from 'util';

import { StorageHelper } from './StorageHelper';

// TODO Replace logger with winston / pino ?

export class LogHelper {
    static readonly isDevEnabled = process.argv.includes('--dev');
    static readonly isDebugEnabled =
        process.argv.includes('--debug') || process.argv.includes('--dev');

    static debug(msg: any, ...args: any): void {
        if (!this.isDebugEnabled) return;
        this.log(LogLevel.DEBUG, msg, ...args);
    }

    static dev(msg: any, ...args: any): void {
        if (!this.isDevEnabled) return;
        this.log(LogLevel.DEV, msg, ...args);
    }

    static error(msg: any, ...args: any): void {
        this.log(LogLevel.ERROR, msg, ...args);
    }

    static fatal(msg: any, ...args: any): void {
        this.log(LogLevel.FATAL, msg, ...args);
        process.exit(1);
    }

    static info(msg: any, ...args: any): void {
        this.log(LogLevel.INFO, msg, ...args);
    }

    static raw(msg: any, ...args: any): void {
        this.log(LogLevel.RAW, msg, ...args);
    }

    static warn(msg: any, ...args: any): void {
        this.log(LogLevel.WARN, msg, ...args);
    }

    private static log(level: LogLevel, msg: any, ...args: any) {
        if (level === LogLevel.RAW) return this.rawLog(msg, ...args);

        const date = new Date().toLocaleString('ru', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });

        this.rawLog(`${date} [${level.toUpperCase()}] ${msg}`, ...args);
    }

    private static rawLog(msg: any, ...args: any) {
        const massage = format(msg, ...args);
        console.log(massage);
        appendFileSync(StorageHelper.logFile, massage + '\n');
    }
}

enum LogLevel {
    DEBUG = 'debug',
    DEV = 'dev',
    ERROR = 'error',
    FATAL = 'fatal',
    INFO = 'info',
    RAW = 'raw',
    WARN = 'warn',
}
