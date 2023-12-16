import { ProfileRequestData, ProfileResponseData } from "@aurora-launcher/core";
import { ConfigManager, ProfilesManager } from "@root/components";
import { AbstractRequest } from "aurora-rpc-server";
import { Inject, Service } from "typedi";

@Service()
export class ProfileWsRequest extends AbstractRequest {
    method = "profile";

    constructor(
        private configManager: ConfigManager,
        @Inject(() => ProfilesManager) // почему-то не инжектится автоматически
        private profilesManager: ProfilesManager,
    ) {
        super();
    }

    invoke({ uuid }: ProfileRequestData): ProfileResponseData {
        return this.profilesManager
            .getProfiles()
            .find((p) => p.uuid === uuid)
            ?.toObject();
    }
}
