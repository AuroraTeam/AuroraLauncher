import { ProfileRequestData, ProfileResponseData } from "@aurora-launcher/core";
import { MojangAuthProviderConfig } from "@root/components/auth/providers";
import { ConfigManager } from "@root/components/config";
import { ProfilesManager } from "@root/components/profiles";
import { AbstractRequest } from "aurora-rpc-server";
import { injectable } from "tsyringe";

// TODO Указание доп.параметров для запуска клиента при использовании различных провайдеров
// Для работы Authlib

@injectable()
export class ProfileRequest extends AbstractRequest {
    method = "profile";

    constructor(
        private configManager: ConfigManager,
        private profilesManager: ProfilesManager,
    ) {
        super();
    }

    invoke({ uuid }: ProfileRequestData): ProfileResponseData {
        const config = this.configManager.config.auth as MojangAuthProviderConfig;

        const profile = this.profilesManager.profiles.find((p) => p.uuid == uuid).toObject();
        profile.jvmArgs.unshift(
            `-Dminecraft.api.auth.host=${config.authHost || "http://127.0.0.1:1370/authlib"}`,
            `-Dminecraft.api.account.host=${config.accountHost || "http://127.0.0.1:1370/authlib"}`,
            `-Dminecraft.api.session.host=${config.sessionHost || "http://127.0.0.1:1370/authlib"}`,
            `-Dminecraft.api.services.host=${
                config.servicesHost || "http://127.0.0.1:1370/authlib"
            }`,
        );

        return profile;
    }
}
