import { appendFileSync } from "fs"
import { EOL } from "os"
import { format } from "util"

import chalk from "chalk"
import stripAnsi from "strip-ansi"

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

        const date = new Date().toLocaleString()

        let coloredStr: string = chalk.gray(date)

        switch (level) {
            case LogLevel.DEBUG:
            case LogLevel.DEV:
                coloredStr += chalk.green(` [${level}] `) + msg
                break
            case LogLevel.ERROR:
            case LogLevel.FATAL:
                coloredStr += chalk.red(` [${level}] ${msg}`)
                break
            case LogLevel.INFO:
                coloredStr += chalk.cyan(` [${level}] `) + msg
                break
            case LogLevel.WARN:
                coloredStr += chalk.yellow(` [${level}] ${msg}`)
                break
        }
        this.rawLog(coloredStr, ...args)
    }

    private static rawLog(msg: any, ...args: any[]) {
        const message = format(msg, ...args) + EOL
        process.stdout.write(message)
        appendFileSync(StorageHelper.logFile, stripAnsi(message))
    }
}

enum LogLevel {
    DEBUG = "DEBUG",
    DEV = "DEV",
    ERROR = "ERROR",
    FATAL = "FATAL",
    INFO = "INFO",
    RAW = "RAW",
    WARN = "WARN",
}
