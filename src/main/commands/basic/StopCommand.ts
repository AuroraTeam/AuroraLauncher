import { AbstractCommand, Category } from "../AbstractCommand"

export class StopCommand extends AbstractCommand {
    constructor() {
        super(
            "stop",
            "Завершает работу сервера",
            Category.BASIC
        )
    }

    invoke(): void {
        process.exit(0)
    }
}
