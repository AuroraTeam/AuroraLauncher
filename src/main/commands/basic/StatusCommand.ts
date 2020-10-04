import { LogHelper } from "./../../helpers/LogHelper"
import { AbstractCommand, Category } from "../AbstractCommand"

export class AboutCommand extends AbstractCommand {
    constructor() {
        super("status", "Выводит статус сервера", Category.BASIC)
    }

    invoke(): void {
        LogHelper.info('Method not implemented')
    }
}
