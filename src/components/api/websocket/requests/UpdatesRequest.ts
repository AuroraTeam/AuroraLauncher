import { App } from "@root/app"
import { AbstractRequest, JsonObject, ResponseResult } from "aurora-rpc-server"

export class UpdatesRequest extends AbstractRequest {
    method = "updates"

    invoke(data: UpdatesRequestData): ResponseResult {
        return App.InstancesManager.hashedDirs.get(data.dir)
    }
}

interface UpdatesRequestData extends JsonObject {
    dir: string
}
