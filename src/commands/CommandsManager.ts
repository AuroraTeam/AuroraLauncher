import ReadLine from "readline"

import { LogHelper } from "@root/helpers"

import { App } from "../LauncherServer"
import { AbstractCommand } from "./AbstractCommand"
import { AboutCommand } from "./basic/AboutCommand"
import { HelpCommand } from "./basic/HelpCommand"
import { LangCommand } from "./basic/LangCommand"
import { StopCommand } from "./basic/StopCommand"
import { UpdateCommand } from "./basic/UpdateCommand"
import { DownloadAssetsCommand } from "./updates/DownloadAssetsCommand"
import { DownloadClientCommand } from "./updates/DownloadClientCommand"
import { SyncAllCommand } from "./updates/SyncAllCommand"
import { SyncProfilesCommand } from "./updates/SyncProfilesCommand"
import { SyncUpdatesCommand } from "./updates/SyncUpdatesCommand"

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
        this.registerCommand(new SyncUpdatesCommand())
        this.registerCommand(new SyncProfilesCommand())
        this.registerCommand(new SyncAllCommand())
        this.registerCommand(new LangCommand())
        this.registerCommand(new UpdateCommand())
    }

    registerCommand(command: AbstractCommand): void {
        this.commands.set(command.name, command)
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
                return LogHelper.error(App.LangManager.getTranslate().CommandsManager.cmdNotFound, cmd)
            LogHelper.dev(App.LangManager.getTranslate().CommandsManager.invokeCmd, cmd)
            this.commands.get(cmd).invoke(...args)
        })
    }
}
