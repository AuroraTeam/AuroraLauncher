import { AbstractCommand, Category } from "../AbstractCommand";
import { App } from "../../LauncherServer";
import { LogHelper } from "../../helpers/LogHelper";

export class DownloadAssetCommand extends AbstractCommand {
    constructor() {
        super(
            "downloadasset",
            "Загрузить ресурсы с зеркала",
            Category.UPDATES,
            "<version> <folder name>"
        )
    }

    invoke(...args: string[]): void {
        const [clientName, dirName] = args;
        if (!clientName) return LogHelper.error('Укажите название/версию ассетов!')
        if (!dirName) return LogHelper.error('Укажите название папки для ассетов!')
        App.MirrorManager.downloadAssets(clientName, dirName)
    }
}