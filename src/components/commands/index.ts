import ReadLine from "readline"

import { App, LauncherServer } from "@root/LauncherServer"
import { AbstractCommand, LogHelper } from "@root/utils"

import { InstancesManager } from "../instances"
import { LangManager } from "../langs"
import { ModulesManager } from "../modules"
import { ProfilesManager } from "../profiles"
import { UpdateManager } from "../update"
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

    constructor(
        private readonly langManager: LangManager,
        private readonly modulesManager: ModulesManager,
        private readonly updateManager: UpdateManager,
        private readonly profilesManager: ProfilesManager,
        private readonly instancesManager: InstancesManager,
        private readonly launcherServer: LauncherServer
    ) {
        this.commandsInit()
        this.consoleInit()
    }

    private commandsInit(): void {
        this.registerCommand(new StopCommand(this.langManager))
        this.registerCommand(new AboutCommand(this.langManager))
        this.registerCommand(new HelpCommand(this.langManager, this))
        this.registerCommand(new DownloadClientCommand(this.langManager, this))
        this.registerCommand(new DownloadAssetsCommand(this.langManager, this))
        this.registerCommand(
            new SyncInstancesCommand(this.langManager, this.instancesManager)
        )
        this.registerCommand(
            new SyncProfilesCommand(this.langManager, this.profilesManager)
        )
        this.registerCommand(
            new SyncAllCommand(
                this.langManager,
                this.profilesManager,
                this.instancesManager
            )
        )
        this.registerCommand(new LangCommand(this.langManager))
        this.registerCommand(
            new UpdateCommand(this.langManager, this.updateManager)
        )
        this.registerCommand(new BranchCommand(this.langManager))
        this.registerCommand(
            new ModulesCommand(this.langManager, this.modulesManager)
        )
        this.registerCommand(
            new ReloadCommand(this.langManager, this.launcherServer)
        )
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
