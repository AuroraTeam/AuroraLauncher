import { AuthRequestData } from "@aurora-launcher/core";
import { ResponseError } from "aurora-rpc-server";

import { ExtendedWebSocketClient } from "../ExtendedWebSocketClient";

export function VerifyMiddleware() {
    return function (_target: object, _method: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (data: AuthRequestData, ws: ExtendedWebSocketClient) {
            if (!ws.isVerified) {
                throw new ResponseError("Not verified launcher", 1);
            }

            return originalMethod.apply(this, [data, ws]);
        };
    };
}
