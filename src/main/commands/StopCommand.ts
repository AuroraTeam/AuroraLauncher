import { AbstractCommand, Category } from "./AbstractCommand"

export class StopCommand extends AbstractCommand {
    name: string = "stop"
    description: string = "Тормоз этой хуеты"
    category: Category = Category.BASIC
    usage: string

    execute(): void {
        process.exit(0)
    }
}
