import { UPDATES_METHOD } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";
import { FastifyRequest } from "fastify";

import { ClientsManager } from "../../../clients";
import { AbstractRequest } from "../AbstractRequest";

@Service([])
export class UpdatesRequest implements AbstractRequest {
    method = "post";
    url = UPDATES_METHOD;

    constructor(private clientsManager: ClientsManager) {}

    handler(req: FastifyRequest<{ Body: { dir: string } }>) {
        return this.clientsManager.hashedClients.get(req.body.dir);
    }
}
