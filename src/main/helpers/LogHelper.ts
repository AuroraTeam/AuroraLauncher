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
