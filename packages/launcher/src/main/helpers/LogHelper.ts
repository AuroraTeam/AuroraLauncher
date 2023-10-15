import { createWriteStream } from 'fs';
import { EOL } from 'os';
import { format } from 'util';

import { StorageHelper } from './StorageHelper';

export class LogHelper {
    static readonly isDevEnabled = process.argv.includes('--dev');
    static readonly isDebugEnabled =
        process.argv.includes('--debug') || process.argv.includes('--dev');

    private static readonly logFileStream = createWriteStream(
        StorageHelper.logFile,
        { flags: 'a' },
    );

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
        const date = new Date().toLocaleString();
        this.rawLog(`${date} [${level.toUpperCase()}] ${msg}`, ...args);
    }

    private static rawLog(msg: any, ...args: any) {
        const message = format(msg, ...args) + EOL;
        process.stdout.write(message);
        this.logFileStream.write(message);
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
