import { ArgsManager } from "@root/components/args";
import { LogHelper } from "@root/utils";
import { ConfigManager, LangManager, VerifyManager} from "@root/components";
import { createServer, ServerMiddlewareCall, CallContext, ServerError, Status } from 'nice-grpc';
import { ServerCredentials } from '@grpc/grpc-js';
import { Service } from "typedi";
import { readFileSync, existsSync } from "fs";
import * as proto from "@aurora-launcher/proto";
import { ServiceImpl } from "./Requests";
import { token } from "./Token";

import { isAbortError } from 'abort-controller-x';

@Service()
export class GrpcServerManager {

    constructor(
        private langManager: LangManager,
        private requests: ServiceImpl,
        private argsManager: ArgsManager,
        private config: ConfigManager,
        private verifyManager: VerifyManager,
    ) {
        const { host, port } = this.argsManager.args;
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
        async function* SecureMiddleware<Request, Response>(
            call: ServerMiddlewareCall<Request, Response>,
            context: CallContext,
        ) {
            if (call.method.path.includes('/getToken')) {
                return yield* call.next(call.request, context);
            }
            const authorization = context.metadata.get('Authorization')
            let decryptedToken
            try {
                decryptedToken = verifyManager.decryptToken(authorization)
            } catch(error) {
                throw new ServerError(Status.UNAUTHENTICATED, "Token not found");
            }
            if (decryptedToken == token){
                return yield* call.next(call.request, context);
            }
            else throw new ServerError(Status.UNAUTHENTICATED, "Invalid token");
        }
        
        const server = createServer().use(loggingMiddleware).use(SecureMiddleware);
        server.add(proto.AuroraLauncherServiceDefinition, requests);

        let credentials = ServerCredentials.createInsecure();
        if (config.config.api.useSSL) {
            if (!existsSync(config.config.api.ssl.cert)) {
                LogHelper.fatal(langManager.getTranslate.WebSocketManager.certNotFound);
            }
            if (!existsSync(config.config.api.ssl.key)) {
                LogHelper.fatal(langManager.getTranslate.WebSocketManager.keyNotFound);
            }
            if (!existsSync(config.config.api.ssl.root_cert)) {
                LogHelper.fatal(langManager.getTranslate.WebSocketManager.certNotFound);
            }
            const key = readFileSync(config.config.api.ssl.key);
            const cert = readFileSync(config.config.api.ssl.cert);
            const root_cert = readFileSync(config.config.api.ssl.root_cert);
            credentials = ServerCredentials.createSsl(root_cert, [{cert_chain: cert, private_key: key}], false);
        }
        server.listen(`${host}:${Number(port)+1}`, credentials);
    }
}
