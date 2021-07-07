import { App } from "../../../LauncherServer"
import { RequestData } from "../types/Request"
import { ResponseData } from "../types/Response"
import { AbstractRequest } from "./AbstractRequest"

// TODO Указание доп.параметров для запуска клиента при использовании различных провайдеров
// Для работы Authlib

export class ProfileRequest extends AbstractRequest {
    type = "profile"

    invoke(data: RequestData): ResponseData {
        return {
            profile: App.ProfilesManager.profiles.find((p) => p.uuid == (data as { uuid: string }).uuid),
        }
    }
}
