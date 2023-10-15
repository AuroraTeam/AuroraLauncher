import { ProfileRequestData, ProfileResponseData } from "@aurora-launcher/core";
import { ConfigManager } from "@root/components/config";
import { ProfilesManager } from "@root/components/profiles";
import { AbstractRequest } from "aurora-rpc-server";
import { injectable } from "tsyringe";

@injectable()
export class ProfileRequest extends AbstractRequest {
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
