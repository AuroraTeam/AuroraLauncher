import { Service } from "@freshgum/typedi";
import { LogHelper } from "@root/helpers";

import { ClientsManager } from "../../../clients/ClientsManager";
import { ConfigManager } from "../../../config/ConfigManager";
import { FabricManager } from "../../../download/DownloadManagers/Fabric";
import { ForgeManager } from "../../../download/DownloadManagers/Forge";
import { MirrorManager } from "../../../download/DownloadManagers/Mirror";
import { MojangManager } from "../../../download/DownloadManagers/Mojang";
import { NeoForgeManager } from "../../../download/DownloadManagers/NeoForge";
import { QuiltManager } from "../../../download/DownloadManagers/Quilt";
import { LangManager } from "../../../langs/LangManager";
import { ProfilesManager } from "../../../profiles/ProfilesManager";
import { Watcher } from "../../../watcher/Watcher";
import { AbstractCommand, CommandCategory } from "../../AbstractCommand";
import { CommandsManager } from "../../CommandsManager";

@Service([LangManager, ProfilesManager, ConfigManager, CommandsManager, ClientsManager, Watcher])
export class DownloadClientCommand extends AbstractCommand {
    constructor(
        private readonly langManager: LangManager,
        private readonly profilesManager: ProfilesManager,
        private readonly configManager: ConfigManager,
        private readonly commandsManager: CommandsManager,
        private readonly clientsManager: ClientsManager,
        private readonly watcher: Watcher,
    ) {
        super({
            name: "downloadclient",
            description:
                langManager.getTranslate.CommandsManager.commands.updates.DownloadClientCommand,
            category: CommandCategory.UPDATES,
            usage: "<version> <client name> <?source type>",
        });
    }

    async invoke(gameVersion?: string, clientName?: string, sourceType = "mojang"): Promise<void> {
        if (!gameVersion) {
            return LogHelper.error("Укажите название/версию клиента!");
        }
        if (!clientName) {
            return LogHelper.error("Укажите название папки для клиента!");
        }

        const DownloadManager = this.getDownloadManager(sourceType);
        if (!DownloadManager) {
            return LogHelper.error(`Неизвестный тип источника: ${sourceType}`);
        }

        this.commandsManager.console.pause();
        try {
            await this.watcher.closeWatcher();
            await new DownloadManager(
                this.langManager,
                this.profilesManager,
                this.configManager,
            ).downloadClient(gameVersion, clientName);
            await this.profilesManager.reloadProfiles();
            await this.clientsManager.hashClients();
        } finally {
            try {
                await this.watcher.subscription();
            } finally {
                this.commandsManager.console.resume();
            }
        }
    }

    private getDownloadManager(sourceType: string) {
        switch (sourceType) {
            case "mirror":
                return MirrorManager;
            case "fabric":
                return FabricManager;
            case "mojang":
                return MojangManager;
            case "quilt":
                return QuiltManager;
            case "forge":
                return ForgeManager;
            case "neoforge":
                return NeoForgeManager;
            default:
                return null;
        }
    }
}
