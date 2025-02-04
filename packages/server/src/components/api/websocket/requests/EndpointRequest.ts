import { EndpointResponseData } from "@aurora-launcher/core";
import { AbstractRequest } from "@aurora-rpc/server";
import { Service } from "typedi";

import { YggdrasilAuthProviderConfig } from "../../../auth";
import { ConfigManager } from "../../../config";

@Service()
export class EndpointWsRequest extends AbstractRequest {
    method = "getEndpoint";

    constructor(private configManager: ConfigManager) {
        super();
    }

    /**
     * It returns the authlib injector endpoint
     * @returns autchlib injector endpoint
     */
    invoke(): EndpointResponseData {
        if (this.configManager.config.auth.type === "yggdrasil") {
            return { url: (<YggdrasilAuthProviderConfig>this.configManager.config.auth).url };
        }
        return {};
    }
}
