import { ConfigManager } from "@root/components/config";
import { ArgsManager } from "@root/components/args";
import { LangManager } from "@root/components/langs";
import type { AuthProvider } from "@root/components/auth/providers";
import { ProfilesManager } from "@root/components/profiles";
import { ClientsManager } from "@root/components/clients";
import { JsonHelper } from "@aurora-launcher/core";
import { createServer, ServerError, Status } from 'nice-grpc';
import { Service, Inject } from "typedi";
import * as proto from "@aurora-launcher/proto";

import { WebServerManager } from "../index";
import { AbstractRequest as AbstractWebRequest } from "../webserver/requests/AbstractRequest";

@Service()
export class WebManager {
    private webServerManager: WebServerManager;

    constructor(
        @Inject("AuthProvider") private authProvider: AuthProvider, 
        private profilesManager: ProfilesManager, 
        private clientsManager: ClientsManager, 
        configManager: ConfigManager, 
        argsManager: ArgsManager, 
        langManager: LangManager
    ) {
        const { host, port } = argsManager.args;
        this.webServerManager = new WebServerManager(configManager, langManager);
        this.webServerManager.server.listen({ host, port });
        this.startGrpcServer(
            this.authProvider,
            this.profilesManager,
            this.clientsManager,
            host, 
            port
        );
    }

    async startGrpcServer(authProvider: AuthProvider, profilesManager: ProfilesManager, clientsManager: ClientsManager, host: string, port: string) {
        const server = createServer();
        server.add(proto.AuroraLauncherServiceDefinition, this.regList(authProvider, profilesManager, clientsManager));

        await server.listen(`${host}:${Number(port)+1}`);
    }

    regList(authProvider: AuthProvider, profilesManager: ProfilesManager, clientsManager: ClientsManager):proto.AuroraLauncherServiceImplementation {
        const ServiceImpl: proto.AuroraLauncherServiceImplementation = {
            async auth(
                request: proto.AuthRequest,
            ): Promise<proto.DeepPartial<proto.AuthResponse>> {
                try {
                    const res = await authProvider.auth(request.login, request.password);
                    //const authData = JsonHelper.toJson({"login":request.login, "password":request.password});
                    //res.token = this.verifyManager.encryptToken(Buffer.from(authData, 'utf8').toString('hex'));
                    return res;
                } catch (error) {
                    throw new ServerError(Status.NOT_FOUND, error.message);
                }
            },
            async getServers(
            ): Promise<proto.DeepPartial<proto.ServersResponse>> {
                const res: proto.ServersResponse = {servers: []};

                profilesManager
                    .getProfiles()
                    .sort((a, b) => a.sortIndex - b.sortIndex)
                    .forEach((profile) => {
                        profile.servers.forEach((server) => {
                            res.servers.push({
                                serverInfo: server,
                                profileUUID: profile.uuid,
                            });
                        });
                    });
                
                return res;
            },
            async getProfile(
                request: proto.ProfileRequest,
            ): Promise<proto.DeepPartial<proto.ProfileResponse>> {
                const res = profilesManager
                .getProfiles()
                .find((p) => p.uuid === request.uuid)
                ?.toObject(); 
                if (res) return res;
                else throw new ServerError(Status.INVALID_ARGUMENT, "Invalid uuid");
            },
            async getUpdates(
                request:proto.UpdateRequest,
            ): Promise<proto.DeepPartial<proto.UpdateResponse>> {
                const test = clientsManager.hashedClients.get(request.dir);
                const res = {hashedFile: test};
                return res
            },
        };
        return ServiceImpl
    }

    public registerWebRequests(requests: AbstractWebRequest[]): void {
        requests.forEach((request) => this.webServerManager.registerRequest(request));
    }
}
