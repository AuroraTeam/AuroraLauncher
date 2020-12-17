import { LogHelper } from "../../helpers/LogHelper"
import { App } from "../../LauncherServer"
import { AbstractRequest, wsErrorResponseWithoutUUID, wsRequest, wsResponseWithoutUUID } from "./AbstractRequest"

export class AuthRequest extends AbstractRequest {
    type = "auth"

    invoke({ data }: wsAuthRequest): wsResponseWithoutUUID | wsErrorResponseWithoutUUID {
        const provider = App.AuthManager.providers.get(App.ConfigManager.getProperty("auth.primaryProvider.type"))
        if (provider === undefined) {
            LogHelper.error("primaryProvider is undefined")
            return {
                code: 103,
                message: "primaryProvider is undefined",
            }
        }

        return provider.emit(data.login, data.password, data.ip)
    }
}

interface wsAuthRequest extends wsRequest {
    data: {
        login: string
        password: string
        ip: string
    }
}
