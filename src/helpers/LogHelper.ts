/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as fs from "fs"
import { format } from "util"

import * as colors from "colors/safe"

import { StorageHelper } from "./StorageHelper"

export class LogHelper {
    static readonly isDevEnabled = process.argv.includes("--dev")
    static readonly isDebugEnabled = process.argv.includes("--debug") || process.argv.includes("--dev")

    static debug(msg: any, ...args: any[]): void {
        if (!this.isDebugEnabled) return
        this.log(LogLevel.DEBUG, msg, ...args)
    }

    static dev(msg: any, ...args: any[]): void {
        if (!this.isDevEnabled) return
        this.log(LogLevel.DEV, msg, ...args)
    }

    static error(msg: any, ...args: any[]): void {
        this.log(LogLevel.ERROR, msg, ...args)
    }

    static fatal(msg: any, ...args: any[]): void {
        this.log(LogLevel.FATAL, msg, ...args)
        process.exit(1)
    }

    static info(msg: any, ...args: any[]): void {
        this.log(LogLevel.INFO, msg, ...args)
    }

    static raw(msg: any, ...args: any[]): void {
        this.log(LogLevel.RAW, msg, ...args)
    }

    static warn(msg: any, ...args: any[]): void {
        this.log(LogLevel.WARN, msg, ...args)
    }

    private static log(level: LogLevel, msg: any, ...args: any[]) {
        if (level === LogLevel.RAW) return this.rawLog(msg, ...args)

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
            case LogLevel.DEV:
                coloredStr += colors.green(` [${level.toUpperCase()}] `) + msg
                break
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                coloredStr += colors.red(` [${level.toUpperCase()}] ${msg}`)
                break
            case LogLevel.INFO:
                coloredStr += colors.cyan(` [${level.toUpperCase()}] `) + msg
                break
            case LogLevel.WARN:
                coloredStr += colors.yellow(` [${level.toUpperCase()}] ${msg}`)
                break
        }
        this.rawLog(coloredStr, ...args)
    }

    /*
     * Заменил console.log на это
     * https://nodejs.org/api/util.html#util_util_format_format_args
     * Оно даже обратно совместимо с console.log (те же подстановочные символы)
     */
    private static rawLog(msg: any, ...args: any[]) {
        const message = format(msg, ...args) + "\n"
        process.stdout.write(message)
        fs.appendFileSync(StorageHelper.logFile, colors.strip(message))
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
