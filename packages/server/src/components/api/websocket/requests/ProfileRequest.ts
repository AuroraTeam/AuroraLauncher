import { ProfileRequestData, ProfileResponseData } from "@aurora-launcher/core";
import { ConfigManager, ProfilesManager } from "@root/components";
import { AbstractRequest } from "aurora-rpc-server";
import { injectable } from "tsyringe";

@injectable()
export class ProfileWsRequest extends AbstractRequest {
    method = "profile";

    constructor(
        private configManager: ConfigManager,
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
