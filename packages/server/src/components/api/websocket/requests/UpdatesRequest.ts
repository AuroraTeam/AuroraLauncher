import { UpdatesRequestData, UpdatesResponseData } from "@aurora-launcher/core";
import { ClientsManager } from "@root/components/clients";
import { AbstractRequest } from "aurora-rpc-server";
import { Service } from "typedi";

@Service()
export class UpdatesWsRequest extends AbstractRequest {
    method = "updates";

    constructor(private clientsManager: ClientsManager) {
        super();
    }

    invoke({ dir }: UpdatesRequestData): UpdatesResponseData {
        return this.clientsManager.hashedClients.get(dir);
    }
}
