import { UPDATES_METHOD, UpdatesRequestData, UpdatesResponseData } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";
import { FastifyRequest } from "fastify";

import { ClientsManager } from "../../../clients/ClientsManager";
import { AbstractRequest } from "../AbstractRequest";

@Service([ClientsManager])
export class UpdatesRequest implements AbstractRequest {
    method = "post";
    url = UPDATES_METHOD;
    schema = {
        body: {
            type: "object",
            required: ["dir"],
            properties: { dir: { type: "string", minLength: 1 } },
        },
    };

    constructor(private clientsManager: ClientsManager) {}

    handler(req: FastifyRequest<{ Body: UpdatesRequestData }>): UpdatesResponseData {
        const files = this.clientsManager.hashedClients.get(req.body.dir);
        if (!files) {
            throw Object.assign(new Error("Client not found"), { statusCode: 404 });
        }
        return files;
    }
}
