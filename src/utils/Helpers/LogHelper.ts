import { createWriteStream } from "fs"
import { EOL } from "os"
import { resolve } from "path"
import { format } from "util"

import chalk from "chalk"
import stripAnsi from "strip-ansi"

import { StorageHelper } from "./StorageHelper"

export class LogHelper {
    private static readonly isDevEnabled = process.argv.includes("--dev")
    private static readonly isDebugEnabled =
        process.argv.includes("--debug") || process.argv.includes("--dev")

    private static getLogDate() {
        return new Date()
            .toISOString()
            .slice(0, 19)
            .replace(/-|:/g, ".")
            .replace("T", "-")
    }

    private static readonly logFilePath = resolve(
        StorageHelper.logsDir,
        `LauncherServer-${this.getLogDate()}.log`
    )

    private static readonly logFileStream = createWriteStream(
        this.logFilePath,
        { flags: "a" }
    )

    public static debug(msg: any, ...args: any[]): void {
        if (!this.isDebugEnabled) return
        this.log(LogLevel.DEBUG, msg, ...args)
    }

    public static dev(msg: any, ...args: any[]): void {
        if (!this.isDevEnabled) return
        this.log(LogLevel.DEV, msg, ...args)
    }

    public static error(msg: any, ...args: any[]): void {
        this.log(LogLevel.ERROR, msg, ...args)
    }

    public static fatal(msg: any, ...args: any[]): void {
        this.log(LogLevel.FATAL, msg, ...args)
        process.exit(1)
    }

    public static info(msg: any, ...args: any[]): void {
        this.log(LogLevel.INFO, msg, ...args)
    }

    public static warn(msg: any, ...args: any[]): void {
        this.log(LogLevel.WARN, msg, ...args)
    }

    public static handleUserPrompt(msg: string) {
        this.saveLog(msg + EOL)
    }

    private static log(level: LogLevel, msg: any, ...args: any[]) {
        let coloredStr: string = chalk.gray(new Date().toLocaleString())

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
        this.raw(coloredStr, ...args)
    }

    public static raw(msg: any, ...args: any[]) {
        const message = format(msg, ...args) + EOL
        process.stdout.write(message)
        this.saveLog(stripAnsi(message))
    }

    private static saveLog(message: string) {
        this.logFileStream.write(message)
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
