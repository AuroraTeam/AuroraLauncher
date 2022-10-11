import { AbstractCommand, Category, LogHelper } from "@root/utils"

import { App } from "@root/app"
import { MirrorManager, FabricManager, MojangManager } from "@root/components/"

export class DownloadClientCommand extends AbstractCommand {
    constructor() {
        super({
            name: "downloadclient",
            description: App.LangManager.getTranslate.CommandsManager.commands.updates.DownloadClientCommand,
            category: Category.UPDATES,
            usage:  "<version> <folder name> <?source type>"
        })
    }

    async invoke(...args: string[]): Promise<void> {
        const [clientName, dirName, sourceType = "mojang"] = args
        if (!clientName) return LogHelper.error("Укажите название/версию клиента!")
        if (!dirName) return LogHelper.error("Укажите название папки для клиента!")

        const DownloadManager = this.getDownloadManager(sourceType)
        if (!DownloadManager) return

        App.CommandsManager.console.pause()
        await new DownloadManager().downloadClient(clientName, dirName)
        App.CommandsManager.console.resume()
    }

    private getDownloadManager(sourceType: string) {
        switch (sourceType) {
            case "mirror":
                return MirrorManager
            case "fabric":
                return FabricManager
            case "mojang":
                return MojangManager
            default:
                LogHelper.error(`Неизвестный тип источника: ${sourceType}`)
                return
        }
    }
}
