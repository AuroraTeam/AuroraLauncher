import * as ReadLine from "readline"
import { AbstractCommand } from "./AbstractCommand"
import { StopCommand } from "./StopCommand"
import { VersionCommand } from "./VersionCommands"
import { HelpCommand } from "./HelpCommand"

export class CommandsManager {
    commands: Map<string, AbstractCommand> = new Map()
    console: ReadLine.Interface

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
        this.console = ReadLine.createInterface({
            input: process.stdin,
            output: process.stdout,
            completer: (line: string) => {
                const completions = Array.from(this.commands.keys())
                const hits = completions.filter((c) => c.startsWith(line))
                return [hits.length ? hits : completions, line]
            }
        })
        this.console.on("line", (line) => {
            const args = line.trim().split(/ +/)
            const cmd = args.shift()
            if (!this.commands.has(cmd)) return console.error(`Command \`${cmd}\` not found!`)
            this.commands.get(cmd).invoke(...args)
        })
    }
}
