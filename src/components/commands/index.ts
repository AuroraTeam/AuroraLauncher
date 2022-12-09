import ReadLine from "readline"

import { AbstractCommand, LogHelper } from "@root/utils"
import { container, injectable, singleton } from "tsyringe"

import { LangManager } from "../langs"
import {
    AboutCommand,
    BranchCommand,
    DownloadAssetsCommand,
    DownloadClientCommand,
    HelpCommand,
    LangCommand,
    ModulesCommand,
    ReloadCommand,
    StopCommand,
    SyncAllCommand,
    SyncInstancesCommand,
    SyncProfilesCommand,
    UpdateCommand,
} from "./commands"

@singleton()
@injectable()
export class CommandsManager {
    commands: Map<string, AbstractCommand> = new Map()
    console: ReadLine.Interface

    constructor(private readonly langManager: LangManager) {
        this.commandsInit()
        this.consoleInit()
    }

    private commandsInit(): void {
        this.registerCommands([
            container.resolve(ReloadCommand),
            container.resolve(ModulesCommand),
            container.resolve(BranchCommand),
            container.resolve(UpdateCommand),
            container.resolve(LangCommand),
            container.resolve(SyncAllCommand),
            container.resolve(SyncProfilesCommand),
            container.resolve(SyncInstancesCommand),
            container.resolve(DownloadAssetsCommand),
            container.resolve(DownloadClientCommand),
            container.resolve(AboutCommand),
            container.resolve(StopCommand),
        ])
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
