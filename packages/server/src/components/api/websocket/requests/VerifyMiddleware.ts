import { ResponseError } from "aurora-rpc-server";

import { ExtendedWebSocketClient } from "../ExtendedWebSocketClient";

export function VerifyMiddleware() {
    return function (target: object, method: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (_: any, ws: ExtendedWebSocketClient) {
            if (!ws.isVerified) {
                throw new ResponseError("Not verified launcher", 1);
            }

            return originalMethod.apply(this, [_, ws]);
        };
    };
}
