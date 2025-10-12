import { UPDATES_METHOD, UpdatesRequestData, UpdatesResponseData } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";
import { FastifyRequest } from "fastify";

import { ClientsManager } from "../../../clients/ClientsManager";
import { AbstractRequest } from "../AbstractRequest";

@Service([ClientsManager])
export class UpdatesRequest implements AbstractRequest {
    method = "post";
    url = UPDATES_METHOD;

    constructor(private clientsManager: ClientsManager) {}

    handler(req: FastifyRequest<{ Body: UpdatesRequestData }>): UpdatesResponseData {
        return this.clientsManager.hashedClients.get(req.body.dir) || [];
    }
}
