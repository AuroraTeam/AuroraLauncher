import { ClientsManager } from "@root/components/instances";
import { AbstractRequest, ResponseResult } from "aurora-rpc-server";
import { injectable } from "tsyringe";

@injectable()
export class UpdatesRequest extends AbstractRequest {
    method = "updates";

    constructor(private instancesManager: ClientsManager) {
        super();
    }

    invoke({ dir }: UpdatesRequestData): ResponseResult {
        return { hashes: this.instancesManager.hashedInstances.get(dir) };
    }
}

interface UpdatesRequestData {
    dir: string;
}
