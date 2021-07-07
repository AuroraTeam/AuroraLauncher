import { MirrorManager } from "../../download/MirrorManager"
import { MojangManager } from "../../download/MojangManager"
import { LogHelper } from "../../helpers/LogHelper"
import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class DownloadAssetsCommand extends AbstractCommand {
    constructor() {
        super("downloadassets", "Загрузить ассеты", Category.UPDATES, "<source type> <version> <folder name>")
    }

    async invoke(...args: string[]): Promise<void> {
        const [sourceType, assetsName, dirName] = args
        if (!sourceType) return LogHelper.error("Укажите тип источника!")
        if (!assetsName) return LogHelper.error("Укажите название/версию ассетов!")
        if (!dirName) return LogHelper.error("Укажите название папки для ассетов!")

        App.CommandsManager.console.pause()
        switch (sourceType) {
            case "mirror":
                await new MirrorManager().downloadAssets(assetsName, dirName)
                break
            case "mojang":
            default:
                await new MojangManager().downloadAssets(assetsName, dirName)
                break
        }
        App.CommandsManager.console.resume()
    }
}
