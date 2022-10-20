import { App } from "@root/LauncherServer"
import { AbstractRequest, ResponseResult } from "aurora-rpc-server"

export class UpdatesRequest extends AbstractRequest {
    method = "updates"

    invoke({ dir }: UpdatesRequestData): ResponseResult {
        return App.InstancesManager.hashedDirs.get(dir)
    }
}

interface UpdatesRequestData {
    dir: string
}
