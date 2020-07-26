import { LauncherServer } from "../LauncherServer"
import * as ReadLine from "readline"
import { AbstractCommand } from "./AbstractCommand"
import { StopCommand } from "./StopCommand"
import { VersionCommand } from "./VersionCommands"
import { HelpCommand } from "./HelpCommand"

export class CommandsManager {
    ls: LauncherServer
    readonly console: ReadLine.Interface = ReadLine.createInterface(process.stdin)
    commands: Map<string, AbstractCommand> = new Map()

    constructor(ls: LauncherServer) {
        this.ls = ls
        this.commandsInit()
        this.consoleInit()
    }

    private commandsInit(): void {
        this.registerCommand(new StopCommand(this.ls))
        this.registerCommand(new VersionCommand(this.ls))
        this.registerCommand(new HelpCommand(this.ls))
    }

    registerCommand(x: AbstractCommand): void {
        this.commands.set(x.getName(), x)
    }

    private consoleInit(): void {
        this.console.on("line", (line) => {
            const args = line.trim().split(/ +/)
            const cmd = args.shift()
            if (!this.commands.has(cmd)) return console.error(`Command \`${cmd}\` not found!`)
            this.commands.get(cmd).invoke(...args)
        })
    }
}
