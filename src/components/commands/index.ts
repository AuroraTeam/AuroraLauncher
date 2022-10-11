import ReadLine from "readline"

import { App } from "@root/app"
import { AbstractCommand, LogHelper } from "@root/utils"

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

export class CommandsManager {
    commands: Map<string, AbstractCommand> = new Map()
    console: ReadLine.Interface

    constructor() {
        this.commandsInit()
        this.consoleInit()
    }

    private commandsInit(): void {
        this.registerCommand(new StopCommand())
        this.registerCommand(new AboutCommand())
        this.registerCommand(new HelpCommand())
        this.registerCommand(new DownloadClientCommand())
        this.registerCommand(new DownloadAssetsCommand())
        this.registerCommand(new SyncInstancesCommand())
        this.registerCommand(new SyncProfilesCommand())
        this.registerCommand(new SyncAllCommand())
        this.registerCommand(new LangCommand())
        this.registerCommand(new UpdateCommand())
        this.registerCommand(new BranchCommand())
        this.registerCommand(new ModulesCommand())
        this.registerCommand(new ReloadCommand())
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
                const hits = completions.filter((c) => c.startsWith(line.toLowerCase()))
                return [hits.length ? hits : completions, line]
            },
            prompt: "",
        })
        this.console.on("line", (line) => {
            LogHelper.handleUserPrompt(line)

            const args = line.match(/"[^"]*"|[^\s"]+/g)?.map((s) => s.trim().replace(/"/g, ""))
            if (!args) return

            const cmd = args.shift().toLowerCase()
            if (!this.commands.has(cmd))
                return LogHelper.error(App.LangManager.getTranslate.CommandsManager.cmdNotFound, cmd)

            LogHelper.dev(App.LangManager.getTranslate.CommandsManager.invokeCmd, cmd)

            this.commands.get(cmd).invoke(...args)
        })
    }
}
