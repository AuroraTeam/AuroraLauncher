import { ConfigManager } from "@root/components/config";
import { ArgsManager } from "@root/components/args";
import { LangManager } from "@root/components/langs";
import { createServer} from 'nice-grpc';
import { Service } from "typedi";
import * as proto from "@aurora-launcher/proto";
import { ServiceImpl } from "./Requests";

import { WebServerManager } from "../index";
import { AbstractRequest as AbstractWebRequest } from "../webserver/requests/AbstractRequest";

@Service()
export class GrpcServerManager {
    private webServerManager: WebServerManager;

    constructor(
        private requests: ServiceImpl,
        configManager: ConfigManager, 
        argsManager: ArgsManager, 
        langManager: LangManager
    ) {
        const { host, port } = argsManager.args;
        this.webServerManager = new WebServerManager(configManager, langManager);
        this.webServerManager.server.listen({ host, port });
        this.startGrpcServer(
            this.requests,
            host, 
            port
        );
    }

    async startGrpcServer(requests:ServiceImpl, host: string, port: string) {
        const server = createServer();
        server.add(proto.AuroraLauncherServiceDefinition, requests);

        await server.listen(`${host}:${Number(port)+1}`);
    }

    public registerWebRequests(requests: AbstractWebRequest[]): void {
        requests.forEach((request) => this.webServerManager.registerRequest(request));
    }
}
