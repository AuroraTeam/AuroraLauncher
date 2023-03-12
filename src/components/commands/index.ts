import ReadLine from "readline"

import { AbstractCommand, LogHelper } from "@root/utils"
import { injectable, singleton } from "tsyringe"

import { LangManager } from "../langs"

@singleton()
@injectable()
export class CommandsManager {
    commands: Map<string, AbstractCommand> = new Map()
    console: ReadLine.Interface

    constructor(private readonly langManager: LangManager) {
        this.consoleInit()
    }

    registerCommands(commands: AbstractCommand[]): void {
        commands.forEach((command: AbstractCommand) => {
            this.commands.set(command.info.name, command)
        })
    }

    private consoleInit(): void {
        this.console = ReadLine.createInterface({
            input: process.stdin,
            output: process.stdout,
            completer: (line: string) => {
                const completions = Array.from(this.commands.keys())
                const hits = completions.filter((c) =>
                    c.startsWith(line.toLowerCase())
                )
                return [hits.length ? hits : completions, line]
            },
            prompt: "",
        })
        this.console.on("line", (line) => {
            LogHelper.handleUserPrompt(line)

            const args = line
                .match(/"[^"]*"|[^\s"]+/g)
                ?.map((s) => s.trim().replace(/"/g, ""))
            if (!args) return

            const cmd = args.shift().toLowerCase()
            if (!this.commands.has(cmd))
                return LogHelper.error(
                    this.langManager.getTranslate.CommandsManager.cmdNotFound,
                    cmd
                )

            LogHelper.dev(
                this.langManager.getTranslate.CommandsManager.invokeCmd,
                cmd
            )

            this.commands.get(cmd).invoke(...args)
        })
    }
}
