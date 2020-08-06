import { AbstractCommand, Category } from "../AbstractCommand"
import { LogHelper } from './../../helpers/LogHelper';

export class AboutCommand extends AbstractCommand {
    constructor() {
        super("status", "Выводит статус сервера", Category.BASIC)
    }

    invoke(): void {
    }
}
