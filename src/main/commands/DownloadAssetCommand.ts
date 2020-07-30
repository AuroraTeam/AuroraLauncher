import { AbstractCommand, Category } from "./AbstractCommand";
import { App } from "../LauncherServer";
import { LogHelper } from "../helpers/LogHelper";

export class DownloadAssetCommand extends AbstractCommand {
    name: string = "downloadasset"
    description: string = "скачать ассеты"
    category: Category = Category.UPDATES
    usage: string = "downloadasset версия-ассетов название-папки"

    invoke(...args: string[]): void {
        const [clientName, dirName] = args;
        if (!clientName) return LogHelper.error('Укажите название/версию ассетов!')
        if (!dirName) return LogHelper.error('Укажите название папки для ассетов!')
        App.MirrorManager.downloadAssets(clientName, dirName)
    }
}