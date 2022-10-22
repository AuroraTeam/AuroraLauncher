import {
    CommandsManager,
    FabricManager,
    LangManager,
    MirrorManager,
    MojangManager,
} from "@root/components/"
import { AbstractCommand, Category, LogHelper } from "@root/utils"

export class DownloadClientCommand extends AbstractCommand {
    constructor(
        langManager: LangManager,
        private readonly commandsManager: CommandsManager
    ) {
        super({
            name: "downloadclient",
            description:
                langManager.getTranslate.CommandsManager.commands.updates
                    .DownloadClientCommand,
            category: Category.UPDATES,
            usage: "<version> <folder name> <?source type>",
        })
    }

    async invoke(...args: string[]): Promise<void> {
        const [clientName, instanceName, sourceType = "mojang"] = args
        if (!clientName)
            return LogHelper.error("Укажите название/версию клиента!")
        if (!instanceName)
            return LogHelper.error("Укажите название папки для инстанции!")

        const DownloadManager = this.getDownloadManager(sourceType)
        if (!DownloadManager) return

        this.commandsManager.console.pause()
        await new DownloadManager().downloadClient(clientName, instanceName)
        this.commandsManager.console.resume()
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
