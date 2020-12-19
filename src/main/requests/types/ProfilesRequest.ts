import { App } from "../../LauncherServer"
import { AbstractRequest, wsResponseWithoutUUID } from "./AbstractRequest"

export class ProfilesRequest extends AbstractRequest {
    type = "profiles"

    invoke(): wsResponseWithoutUUID {
        return {
            data: App.ProfilesManager.profiles,
        }
    }
}
