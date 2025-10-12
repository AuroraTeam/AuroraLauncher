import { Service } from "@freshgum/typedi";
import { ConfigManager } from "@root/components/config/ConfigManager";
import { FastifyReply, FastifyRequest } from "fastify";

import { AbstractRequest } from "./AbstractRequest";

@Service([ConfigManager])
export class IndexRequest implements AbstractRequest {
    readonly method = "get";
    readonly url = "/";

    constructor(private configManager: ConfigManager) {}

    async handler(req: FastifyRequest, rep: FastifyReply) {
        if (req.headers["user-agent"]?.startsWith("Java")) {
            rep.header("X-Authlib-Injector-API-Location", "/authlib");
            return rep.send();
        }

        const { useSSL } = this.configManager.config.api;
        rep.redirect(`http${useSSL ? "s" : ""}://${req.headers.host}/files/`, 301);
    }
}
