import * as proto from "@aurora-launcher/proto";
import { ServerError, Status } from 'nice-grpc';
import { Service, Inject } from "typedi";
import type { AuthProvider } from "@root/components/auth/providers";
import { ProfilesManager } from "@root/components/profiles";
import { ClientsManager } from "@root/components/clients";

@Service()
export class ServiceImpl implements proto.AuroraLauncherServiceImplementation {
    constructor(
        @Inject("AuthProvider") private authProvider: AuthProvider, 
        private profilesManager: ProfilesManager, 
        private clientsManager: ClientsManager,
    ) {}

    async auth(
        request: proto.AuthRequest,
    ): Promise<proto.DeepPartial<proto.AuthResponse>> {
        try {
            const res = await this.authProvider.auth(request.login, request.password);
            //const authData = JsonHelper.toJson({"login":request.login, "password":request.password});
            //res.token = this.verifyManager.encryptToken(Buffer.from(authData, 'utf8').toString('hex'));
            return res;
        } catch (error) {
            throw new ServerError(Status.NOT_FOUND, error.message);
        }
    }

    async getServers(
    ): Promise<proto.DeepPartial<proto.ServersResponse>> {
        const res: proto.ServersResponse = {servers: []};

        this.profilesManager
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
    }

    async getProfile(
        request: proto.ProfileRequest,
    ): Promise<proto.DeepPartial<proto.ProfileResponse>> {
        const res = this.profilesManager
        .getProfiles()
        .find((p) => p.uuid === request.uuid)
        ?.toObject();
        if (res) return res;
        else throw new ServerError(Status.INVALID_ARGUMENT, "Invalid uuid");
    }
    
    async getUpdates(
        request:proto.UpdateRequest,
    ): Promise<proto.DeepPartial<proto.UpdateResponse>> {
        const res = {hashedFile: this.clientsManager.hashedClients.get(request.dir)};
        return res
    }
  }