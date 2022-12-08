import {
    CommandsManager,
    ConfigManager,
    LangManager,
    MirrorManager,
    MojangManager,
    ProfilesManager,
} from "@root/components"
import { AbstractCommand, Category, LogHelper } from "@root/utils"
import { delay, inject, injectable } from "tsyringe"

@injectable()
export class DownloadAssetsCommand extends AbstractCommand {
    constructor(
        private readonly langManager: LangManager,
        private readonly profilesManager: ProfilesManager,
        private readonly configManager: ConfigManager,
        @inject(delay(() => CommandsManager))
        private readonly commandsManager: CommandsManager
    ) {
        super({
            name: "downloadassets",
            description:
                langManager.getTranslate.CommandsManager.commands.updates
                    .DownloadAssetsCommand,
            category: Category.UPDATES,
            usage: "<version> <folder name> <?source type>",
        })
    }

    async invoke(...args: string[]): Promise<void> {
        const [assetsVer, sourceType = "mojang"] = args
        if (!assetsVer) return LogHelper.error("Укажите версию ассетов!")

        const DownloadManager = this.getDownloadManager(sourceType)
        if (!DownloadManager) return

        this.commandsManager.console.pause()
        await new DownloadManager(this.langManager, this.profilesManager, this.configManager).downloadAssets(assetsVer)
        this.commandsManager.console.resume()
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
