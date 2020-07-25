import { LauncherServer } from "../LauncherServer"
import * as ReadLine from "readline"
import { AbstractCommand } from "./AbstractCommand"
import { StopCommand } from "./StopCommand"

export class CommandsManager {
    ls: LauncherServer
    console: ReadLine.Interface
    commands: Map<string, AbstractCommand>

    constructor(ls: LauncherServer) {
        this.ls = ls
        this.commandsInit()
        this.consoleInit()
    }

    private commandsInit(): void {
        this.commands = new Map()
        this.commands.set('stop', new StopCommand)
        //this.commands.set('example2', new ExampleCommand2);
        //this.commands.set('example3', new ExampleCommand3);
    }

    private consoleInit(): void {
        this.console = ReadLine.createInterface({
            input: process.stdin,
            output: process.stdout
        })

        // test
        this.console.on('line', line => {
            let cmd = line.trim()
            console.log(`Received: ${line}`)
            if (!this.commands.has(cmd)) return console.error(`Command \`${cmd}\` not found!`)
            this.commands.get(cmd).emit()
        })
    }
}
