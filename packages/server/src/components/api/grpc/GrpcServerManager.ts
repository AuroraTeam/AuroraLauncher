import { ArgsManager } from "@root/components/args";
import { LogHelper } from "@root/utils";
import { createServer, ServerMiddlewareCall, CallContext, ServerError, Status } from 'nice-grpc';
import { Service } from "typedi";
import * as proto from "@aurora-launcher/proto";
import { ServiceImpl } from "./Requests";

import { isAbortError } from 'abort-controller-x';

@Service()
export class GrpcServerManager {

    constructor(
        private requests: ServiceImpl,
        private argsManager: ArgsManager, 
    ) {
        const { host, port } = this.argsManager.args;
        this.startGrpcServer(
            this.requests,
            host, 
            port
        );
    }

    async startGrpcServer(requests:ServiceImpl, host: string, port: string) {
        async function* loggingMiddleware<Request, Response>(
            call: ServerMiddlewareCall<Request, Response>,
            context: CallContext,
        ) {
            const {path} = call.method;
            
            LogHelper.debug('Server call', path, 'request:', call.request);
            
            try {
                const result = yield* call.next(call.request, context);
            
                LogHelper.debug('Server call', path, 'response:', result);
            
                return result;
            } catch (error) {
                if (error instanceof ServerError) {
                    LogHelper.debug(
                        'Server call',
                        path,
                        `end: ${Status[error.code]}: ${error.details}`,
                    );
                } else if (isAbortError(error)) {
                    LogHelper.debug('Server call', path, 'cancel');
                } else {
                    LogHelper.debug('Server call', path, `error: ${error?.stack}`);
                }
                throw error;
            }
        }
        
        const server = createServer().use(loggingMiddleware);
        server.add(proto.AuroraLauncherServiceDefinition, requests);

        await server.listen(`${host}:${Number(port)+1}`);
    }
}
