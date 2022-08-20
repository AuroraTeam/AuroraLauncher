import { App } from "@root/LauncherServer"
import { AbstractRequest, JsonObject, ResponseResult } from "aurora-rpc-server"

export class UpdatesRequest extends AbstractRequest {
    method = "updates"

    invoke(data: UpdatesRequestData): ResponseResult {
        return App.UpdatesManager.hashDirs.get(data.dir)
    }
}

interface UpdatesRequestData extends JsonObject {
    dir: string
}
