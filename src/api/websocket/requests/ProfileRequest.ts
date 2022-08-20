import { MojangAuthProvider } from "@root/auth/authProviders/MojangAuthProvider"
import { App } from "@root/LauncherServer"
import { AbstractRequest, JsonObject, ResponseResult } from "aurora-rpc-server"

// TODO Указание доп.параметров для запуска клиента при использовании различных провайдеров
// Для работы Authlib

export class ProfileRequest extends AbstractRequest {
    method = "profile"

    invoke(data: ProfileRequestData): ResponseResult {
        const config = App.ConfigManager.getConfig().auth as MojangAuthProvider["config"]

        const profile = App.ProfilesManager.profiles.find((p) => p.uuid == data.uuid)
        profile.jvmArgs.push(
            `-Dminecraft.api.auth.host=${config.authHost || "http://127.0.0.1:1370/authlib"}`,
            `-Dminecraft.api.account.host=${config.accountHost || "http://127.0.0.1:1370/authlib"}`,
            `-Dminecraft.api.session.host=${config.sessionHost || "http://127.0.0.1:1370/authlib"}`,
            `-Dminecraft.api.services.host=${config.servicesHost || "http://127.0.0.1:1370/authlib"}`
        )

        return profile.toObject()
    }
}

interface ProfileRequestData extends JsonObject {
    uuid: string
}
