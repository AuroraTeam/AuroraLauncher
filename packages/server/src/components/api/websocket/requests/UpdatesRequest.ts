import { UpdatesRequestData, UpdatesResponseData } from "@aurora-launcher/core";
import { ClientsManager } from "@root/components/clients";
import { AbstractRequest } from "aurora-rpc-server";
import { injectable } from "tsyringe";

@injectable()
export class UpdatesRequest extends AbstractRequest {
    method = "updates";

    constructor(private clientsManager: ClientsManager) {
        super();
    }

    invoke({ dir }: UpdatesRequestData): UpdatesResponseData {
        return this.clientsManager.hashedClients.get(dir);
    }
}
