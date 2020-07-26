import * as colors from "colors/safe"

export class LogHelper {
    static debug(msg: any, ...args: any) {
        this.log(LogLevel.DEBUG, msg, ...args)
    }

    static dev(msg: any, ...args: any) {
        this.log(LogLevel.DEV, msg, ...args)
    }

    static error(msg: any, ...args: any) {
        this.log(LogLevel.ERROR, msg, ...args)
    }

    static fatal(msg: any, ...args: any) {
        this.log(LogLevel.FATAL, msg, ...args)
        process.exit(1)
    }

    static info(msg: any, ...args: any) {
        this.log(LogLevel.INFO, msg, ...args)
    }

    static raw(msg: any, ...args: any) {
        this.log(LogLevel.RAW, msg, ...args)
    }

    static warn(msg: any, ...args: any) {
        this.log(LogLevel.WARN, msg, ...args)
    }

    private static log(level: LogLevel, msg: any, ...args: any) {
        if (level == LogLevel.RAW) return console.log(msg, ...args)

        const date = new Date()
            .toLocaleString("ru", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            })
            .replace(/-/g, ".")

        let coloredStr: string = colors.gray(date)
        switch (level) {
            case LogLevel.DEBUG:
                coloredStr = coloredStr.concat(colors.green(` [${level.toUpperCase()}] `), msg)
                break
            case LogLevel.DEV:
                coloredStr = coloredStr.concat(colors.green(` [${level.toUpperCase()}] `), msg)
                break
            case LogLevel.ERROR:
                coloredStr = coloredStr.concat(colors.red(` [${level.toUpperCase()}] ${msg}`))
                break
            case LogLevel.FATAL:
                coloredStr = coloredStr.concat(colors.red(` [${level.toUpperCase()}] ${msg}`))
                break
            case LogLevel.INFO:
                coloredStr = coloredStr.concat(colors.cyan(` [${level.toUpperCase()}] `), msg)
                break
            case LogLevel.WARN:
                coloredStr = coloredStr.concat(colors.yellow(` [${level.toUpperCase()}] ${msg}`))
                break
        }
        console.log(coloredStr, ...args)
    }
}

enum LogLevel {
    DEBUG = "debug",
    DEV = "dev",
    ERROR = "error",
    FATAL = "fatal",
    INFO = "info",
    RAW = "raw",
    WARN = "warn",
}
