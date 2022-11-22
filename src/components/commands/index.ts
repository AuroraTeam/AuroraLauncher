import ReadLine from "readline"

import { App } from "@root/app"
import { AbstractCommand, LogHelper } from "@root/utils"
import { container, injectable, singleton } from "tsyringe"

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

    constructor() {
        this.commandsInit()
        this.consoleInit()
    }

    private commandsInit(): void {
        this.registerCommand(container.resolve(StopCommand))
        this.registerCommand(container.resolve(AboutCommand))
        this.registerCommand(container.resolve(HelpCommand))
        this.registerCommand(container.resolve(DownloadClientCommand))
        this.registerCommand(container.resolve(DownloadAssetsCommand))
        this.registerCommand(container.resolve(SyncInstancesCommand))
        this.registerCommand(container.resolve(SyncProfilesCommand))
        this.registerCommand(container.resolve(SyncAllCommand))
        this.registerCommand(container.resolve(LangCommand))
        this.registerCommand(container.resolve(UpdateCommand))
        this.registerCommand(container.resolve(BranchCommand))
        this.registerCommand(container.resolve(ModulesCommand))
        this.registerCommand(container.resolve(ReloadCommand))
    }

    registerCommand(command: AbstractCommand): void {
        this.commands.set(command.info.name, command)
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
                    App.LangManager.getTranslate.CommandsManager.cmdNotFound,
                    cmd
                )

            LogHelper.dev(
                App.LangManager.getTranslate.CommandsManager.invokeCmd,
                cmd
            )

            this.commands.get(cmd).invoke(...args)
        })
    }
}
