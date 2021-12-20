import { MirrorManager } from "../../download/MirrorManager"
import { MojangManager } from "../../download/MojangManager"
import { LogHelper } from "../../helpers/LogHelper"
import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class DownloadAssetsCommand extends AbstractCommand {
    constructor() {
        super("downloadassets", "Загрузить ассеты", Category.UPDATES, "<version> <folder name> <?source type>")
    }

    async invoke(...args: string[]): Promise<void> {
        const [assetsName, dirName, sourceType = "mojang"] = args
        if (!assetsName) return LogHelper.error("Укажите название/версию ассетов!")
        if (!dirName) return LogHelper.error("Укажите название папки для ассетов!")

        App.CommandsManager.console.pause()
        switch (sourceType) {
            case "mirror":
                await new MirrorManager().downloadAssets(assetsName, dirName)
                break
            case "mojang":
                await new MojangManager().downloadAssets(assetsName, dirName)
                break
            default:
                LogHelper.error(`Неизвестный тип источника: ${sourceType}`)
                break
        }
        App.CommandsManager.console.resume()
    }
}
