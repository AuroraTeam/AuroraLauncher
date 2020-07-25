import { AbstractCommand } from "./AbstractCommand"

export class StopCommand extends AbstractCommand {
    name: string
    description: string
    category: string
    usage: string

    emit(): void {
        process.exit(0)
    }
}