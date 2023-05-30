import { ClientsManager } from "@root/components/clients";
import { AbstractRequest, ResponseResult } from "aurora-rpc-server";
import { injectable } from "tsyringe";

@injectable()
export class UpdatesRequest extends AbstractRequest {
    method = "updates";

    constructor(private clientsManager: ClientsManager) {
        super();
    }

    invoke({ dir }: UpdatesRequestData): ResponseResult {
        return { hashes: this.clientsManager.hashedClients.get(dir) };
    }
}

interface UpdatesRequestData {
    dir: string;
}
