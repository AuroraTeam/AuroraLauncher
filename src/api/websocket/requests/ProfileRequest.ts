import { App } from "../../../LauncherServer"
import { RequestData } from "../types/Request"
import { ResponseData } from "../types/Response"
import { AbstractRequest } from "./AbstractRequest"

// TODO Указание доп.параметров для запуска клиента при использовании различных провайдеров
// Для работы Authlib

export class ProfileRequest extends AbstractRequest {
    type = "profile"

    invoke(data: ProfileRequestData): ResponseData {
        const config = App.ConfigManager.getConfig().auth as any

        const profile = App.ProfilesManager.profiles.find((p) => p.uuid == data.uuid)
        profile.jvmArgs = profile.jvmArgs.concat([
            `-Dminecraft.api.auth.host=${config.authHost || "http://127.0.0.1:1370/authlib"}`,
            `-Dminecraft.api.account.host=${config.accountHost || "http://127.0.0.1:1370/authlib"}`,
            `-Dminecraft.api.session.host=${config.sessionHost || "http://127.0.0.1:1370/authlib"}`,
            `-Dminecraft.api.services.host=${config.servicesHost || "http://127.0.0.1:1370/authlib"}`,
        ])

        return {
            profile,
        }
    }
}

interface ProfileRequestData extends RequestData {
    uuid: string
}
