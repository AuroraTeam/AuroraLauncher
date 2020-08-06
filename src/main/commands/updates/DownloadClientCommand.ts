import { LogHelper } from "../../helpers/LogHelper"
import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class DownloadClientCommand extends AbstractCommand {
    constructor() {
        super("downloadclient", "Загрузить клиент с зеркала", Category.UPDATES, "<version> <folder name>")
    }

    invoke(...args: string[]): void {
        const [clientName, dirName] = args
        if (!clientName) return LogHelper.error("Укажите название/версию клиента!")
        if (!dirName) return LogHelper.error("Укажите название папки для клиента!")
        App.MirrorManager.downloadClient(clientName, dirName)
    }
}
