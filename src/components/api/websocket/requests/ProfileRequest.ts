import { App } from "@root/app"
import { MojangAuthProviderConfig } from "@root/components/auth/authProviders/MojangAuthProvider"
import { ProfileConfig } from "@root/components/profiles/utils/ProfileConfig"
import { AbstractRequest, ResponseResult } from "aurora-rpc-server"

// TODO Указание доп.параметров для запуска клиента при использовании различных провайдеров
// Для работы Authlib

export class ProfileRequest extends AbstractRequest {
    method = "profile"

    invoke(data: ProfileRequestData): ResponseResult {
        const config = App.ConfigManager.config.auth as MojangAuthProviderConfig

        const profile = App.ProfilesManager.profiles.find(
            (p: ProfileConfig) => p.uuid == data.uuid
        )
        profile.jvmArgs.push(
            `-Dminecraft.api.auth.host=${
                config.authHost || "http://127.0.0.1:1370/authlib"
            }`,
            `-Dminecraft.api.account.host=${
                config.accountHost || "http://127.0.0.1:1370/authlib"
            }`,
            `-Dminecraft.api.session.host=${
                config.sessionHost || "http://127.0.0.1:1370/authlib"
            }`,
            `-Dminecraft.api.services.host=${
                config.servicesHost || "http://127.0.0.1:1370/authlib"
            }`
        )

        return profile.toObject()
    }
}

interface ProfileRequestData {
    uuid: string
}
