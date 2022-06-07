import { MirrorManager } from "../../download/MirrorManager"
import { MojangManager } from "../../download/MojangManager"
import { LogHelper } from "../../helpers/LogHelper"
import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class DownloadAssetsCommand extends AbstractCommand {
    constructor() {
        super({
            name: "downloadassets",
            description: App.LangManager.getTranslate().CommandsManager.commands.updates.DownloadAssetsCommand,
            category: Category.UPDATES,
            usage: "<version> <folder name> <?source type>",
        })
    }

    async invoke(...args: string[]): Promise<void> {
        const [assetsName, dirName, sourceType = "mojang"] = args
        if (!assetsName) return LogHelper.error("Укажите название/версию ассетов!")
        if (!dirName) return LogHelper.error("Укажите название папки для ассетов!")

        const DownloadManager = DownloadAssetsCommand.getDownloadManager(sourceType)
        if (!DownloadManager) return

        App.CommandsManager.console.pause()
        await new DownloadManager().downloadAssets(assetsName, dirName)
        App.CommandsManager.console.resume()
    }

    private static getDownloadManager(sourceType: string) {
        switch (sourceType) {
            case "mirror":
                return MirrorManager
            case "mojang":
                return MojangManager
            default:
                LogHelper.error(`Неизвестный тип источника: ${sourceType}`)
                return
        }
    }
}
