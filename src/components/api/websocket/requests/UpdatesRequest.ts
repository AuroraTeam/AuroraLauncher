import { ClientsManager } from "@root/components/instances";
import { AbstractRequest, ResponseResult } from "aurora-rpc-server";
import { injectable } from "tsyringe";

@injectable()
export class UpdatesRequest extends AbstractRequest {
    method = "updates";

    constructor(private instancesManager: ClientsManager) {
        super();
    }

    invoke({ client }: UpdatesRequestData): ResponseResult {
        return this.instancesManager.hashedInstances.get(client);
    }
}

interface UpdatesRequestData {
    client: string;
}
