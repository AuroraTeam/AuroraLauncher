import { App } from "@root/app"
import { MirrorManager, MojangManager } from "@root/components"
import { AbstractCommand, Category, LogHelper } from "@root/utils"

export class DownloadAssetsCommand extends AbstractCommand {
    constructor() {
        super({
            name: "downloadassets",
            description: App.LangManager.getTranslate.CommandsManager.commands.updates.DownloadAssetsCommand,
            category: Category.UPDATES,
            usage: "<version> <folder name> <?source type>",
        })
    }

    async invoke(...args: string[]): Promise<void> {
        const [assetsName, dirName, sourceType = "mojang"] = args
        if (!assetsName) return LogHelper.error("Укажите название/версию ассетов!")
        if (!dirName) return LogHelper.error("Укажите название папки для ассетов!")

        const DownloadManager = this.getDownloadManager(sourceType)
        if (!DownloadManager) return

        App.CommandsManager.console.pause()
        await new DownloadManager().downloadAssets(assetsName, `assets${assetsName}`)
        App.CommandsManager.console.resume()
    }

    private getDownloadManager(sourceType: string) {
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
