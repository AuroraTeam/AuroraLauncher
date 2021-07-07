import { FabricManager } from "../../download/FabricManager"
import { MirrorManager } from "../../download/MirrorManager"
import { MojangManager } from "../../download/MojangManager"
import { LogHelper } from "../../helpers/LogHelper"
import { App } from "../../LauncherServer"
import { AbstractCommand, Category } from "../AbstractCommand"

export class DownloadClientCommand extends AbstractCommand {
    constructor() {
        super("downloadclient", "Загрузить клиент", Category.UPDATES, "<version> <folder name> <?source type>")
    }

    async invoke(...args: string[]): Promise<void> {
        const [clientName, dirName, sourceType = "mojang"] = args
        if (!clientName) return LogHelper.error("Укажите название/версию клиента!")
        if (!dirName) return LogHelper.error("Укажите название папки для клиента!")

        App.CommandsManager.console.pause()
        switch (sourceType) {
            case "mirror":
                await new MirrorManager().downloadClient(clientName, dirName)
                break
            case "fabric":
                await new FabricManager().downloadClient(clientName, dirName)
                break
            case "mojang":
                await new MojangManager().downloadClient(clientName, dirName)
                break
            default:
                LogHelper.error(`Неизвестный тип источника: ${sourceType}`)
                break
        }
        App.CommandsManager.console.resume()
    }
}
