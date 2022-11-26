import { InstancesManager } from "@root/components/instances"
import { AbstractRequest, ResponseResult } from "aurora-rpc-server"
import { injectable } from "tsyringe"

@injectable()
export class UpdatesRequest extends AbstractRequest {
    method = "updates"

    constructor(private instancesManager: InstancesManager) {
        super()
    }

    invoke({ type, dir }: UpdatesRequestData): ResponseResult {
        return this.instancesManager.hashedDirs[type].get(dir)
    }
}

interface UpdatesRequestData {
    type: "assets" | "libraries" | "instances"
    dir: string
}
