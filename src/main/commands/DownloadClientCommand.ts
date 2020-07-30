import { AbstractCommand, Category } from "./AbstractCommand";
import { App } from "../LauncherServer";
import { LogHelper } from "../helpers/LogHelper";

export class DownloadClientCommand extends AbstractCommand {
    name: string = "downloadclient"
    description: string = "скачать клиент"
    category: Category = Category.UPDATES
    usage: string = "downloadclient версия-клиента название-папки"

    invoke(...args: string[]): void {
        const [clientName, dirName] = args;
        if (!clientName) return LogHelper.error('Укажите название/версию клиента!')
        if (!dirName) return LogHelper.error('Укажите название папки для клиента!')
        App.MirrorManager.downloadClient(clientName, dirName)
    }
}