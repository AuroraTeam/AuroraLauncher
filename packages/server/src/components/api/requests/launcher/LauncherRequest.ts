import { AuthType, LAUNCHER_METHOD, LauncherResponse } from "@aurora-launcher/core";
import { Service } from "@freshgum/typedi";

import { AbstractRequest } from "../AbstractRequest";

@Service([])
export class LauncherRequest implements AbstractRequest {
    method = "get";
    url = LAUNCHER_METHOD;

    handler(): LauncherResponse {
        return {
            settings: {
                authType: AuthType.INTERNAL,
            },
        };
    }
}
