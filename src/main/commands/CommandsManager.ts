import * as ReadLine from "readline"
import { AbstractCommand } from "./AbstractCommand"
import { StopCommand } from "./StopCommand"
import { VersionCommand } from "./VersionCommands"
import { HelpCommand } from "./HelpCommand"

export class CommandsManager {
    readonly console: ReadLine.Interface = ReadLine.createInterface(process.stdin)
    commands: Map<string, AbstractCommand> = new Map()

    constructor() {
        this.commandsInit()
        this.consoleInit()
    }

    private commandsInit(): void {
        this.registerCommand(new StopCommand())
        this.registerCommand(new VersionCommand())
        this.registerCommand(new HelpCommand())
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
