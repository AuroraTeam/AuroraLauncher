import * as colors from "colors/safe"

export class LogHelper {
    static dev(msg: any) {
        this.log(LogLevel.DEV, msg)
    }

    static debug(msg: any) {
        this.log(LogLevel.DEBUG, msg)
    }

    static info(msg: any) {
        this.log(LogLevel.INFO, msg)
    }

    static warn(msg: any) {
        this.log(LogLevel.WARN, msg)
    }

    static error(msg: any) {
        this.log(LogLevel.ERROR, msg)
    }

    static fatal(msg: any) {
        this.log(LogLevel.FATAL, msg)
    }

    static raw(msg: any) {
        this.log(LogLevel.RAW, msg)
    }

    private static log(level: LogLevel, msg: any) {
        let prefix = (new Date).toLocaleString('ru', {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }).replace(/-/g, ".")
        if (level === LogLevel.RAW) {
            console.log(msg)
        } else {
            let color: Function
            switch (level) {
                case LogLevel.DEV:
                case LogLevel.DEBUG:
                    color = colors.green
                    break;
                case LogLevel.INFO:
                    color = colors.cyan
                    break;
                case LogLevel.WARN:
                    color = colors.yellow
                    break;
                case LogLevel.ERROR:
                case LogLevel.FATAL:
                    color = colors.red
                    break;
            }
            console.log(colors.gray(prefix) + color(` [${level.toUpperCase()}] `) + msg);
        }
    }
}

enum LogLevel {
    DEV = "dev",
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
    FATAL = "fatal",
    RAW = "raw"
}
