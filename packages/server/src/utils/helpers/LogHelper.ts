import { createWriteStream } from "fs";
import { EOL } from "os";
import { resolve } from "path";
import { format } from "util";

import chalk from "chalk";
import stripAnsi from "strip-ansi";

import { version } from "../../../package.json";
import { StorageHelper } from "./StorageHelper";

const LOG_LEVELS = {
    DEBUG: chalk.green,
    DEV: chalk.green,
    ERROR: chalk.red,
    FATAL: chalk.red,
    INFO: chalk.cyan,
    WARN: chalk.yellow,
};

export class LogHelper {
    private static readonly isDevEnabled: boolean = process.argv.includes("--dev") || process.env.AURORA_IS_DEV === "true";
    private static readonly isDebugEnabled: boolean =
        process.argv.includes("--debug") || process.env.AURORA_IS_DEBUG === "true" || this.isDevEnabled;

    private static getLogFilePath(): string {
        const dateStr = new Date()
            .toISOString()
            .slice(0, 19)
            .replace(/[-:]/g, ".")
            .replace("T", "-");

        return resolve(StorageHelper.logsDir, `LauncherServer-${dateStr}.log`);
    }

    private static readonly logFileStream = createWriteStream(LogHelper.getLogFilePath(), {
        flags: "a",
    });

    public static debug(msg: any, ...args: any[]): void {
        if (!this.isDebugEnabled) return;
        this.log("DEBUG", msg, ...args);
    }

    public static dev(msg: any, ...args: any[]): void {
        if (!this.isDevEnabled) return;
        this.log("DEV", msg, ...args);
    }

    public static error(msg: any, ...args: any[]): void {
        this.log("ERROR", msg, ...args);
    }

    public static fatal(msg: any, ...args: any[]): void {
        this.log("FATAL", msg, ...args);
        process.abort();
    }

    public static info(msg: any, ...args: any[]): void {
        this.log("INFO", msg, ...args);
    }

    public static warn(msg: any, ...args: any[]): void {
        this.log("WARN", msg, ...args);
    }

    public static handleUserPrompt(msg: string) {
        this.saveLog(msg + EOL);
    }

    private static log(level: keyof typeof LOG_LEVELS, msg: any, ...args: any[]) {
        const coloredStr = [
            chalk.gray(new Date().toLocaleString()),
            LOG_LEVELS[level](` [${level}] `),
            msg,
        ].join("");

        this.raw(coloredStr, ...args);
    }

    public static raw(msg: any, ...args: any[]) {
        const message = format(msg, ...args) + EOL;
        process.stdout.write(message);

        this.saveLog(stripAnsi(message));
    }

    private static saveLog(message: string) {
        this.logFileStream.write(message);
    }

    public static printVersion() {
        LogHelper.raw(
            chalk.bold(
                chalk.cyan("AuroraLauncher ") +
                    chalk.green("LauncherServer ") +
                    chalk.yellow(`v${version}`) +
                    chalk.green(`\nCopyright (C) 2020 - ${new Date().getFullYear()} `) +
                    chalk.blue("AuroraTeam (https://github.com/AuroraTeam)") +
                    chalk.green("\nLicensed under the MIT License") +
                    chalk.green("\nDocumentation page: ") +
                    chalk.blue("https://docs.aurora-launcher.ru/")
            )
        );
    }
}
