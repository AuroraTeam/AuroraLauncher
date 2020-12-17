import { AbstractProvider } from "../../auth/primaryProviders/AbstractProvider"
import { AcceptAuthProvider } from "../../auth/primaryProviders/AcceptAuthProvider"
import { LogHelper } from "../../helpers/LogHelper"
import { App } from "../../LauncherServer"
import { AbstractRequest, wsErrorResponseWithoutUUID, wsRequest, wsResponseWithoutUUID } from "./AbstractRequest"

export class AuthRequest extends AbstractRequest {
    type = "auth"
    providers: Map<string, AbstractProvider> = new Map()

    constructor() {
        super()
        this.providers.set("accept", new AcceptAuthProvider())
    }

    invoke({ data }: wsAuthRequest): wsResponseWithoutUUID | wsErrorResponseWithoutUUID {
        const provider = this.providers.get(App.ConfigManager.getProperty("auth.primaryProvider.type"))
        if (provider === undefined) {
            LogHelper.error("primaryProvider is undefined")
            return {
                code: 103,
                message: "primaryProvider is undefined",
            }
        }

        const result = provider.emit(data.login, data.password, data.ip)

        return {
            data: {
                login: result,
            },
        }
    }
}

interface wsAuthRequest extends wsRequest {
    data: {
        login: string
        password: string
        ip: string
    }
}
