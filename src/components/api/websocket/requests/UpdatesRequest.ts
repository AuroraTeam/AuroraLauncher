import { App } from "@root/LauncherServer"
import { AbstractRequest, ResponseResult } from "aurora-rpc-server"

export class UpdatesRequest extends AbstractRequest {
    method = "updates"

    invoke({ type, dir }: UpdatesRequestData): ResponseResult {
        return App.InstancesManager.hashedDirs[type].get(dir)
    }
}

interface UpdatesRequestData {
    type: "assets" | "libraries" | "instances"
    dir: string
}
