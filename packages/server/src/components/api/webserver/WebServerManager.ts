import { fastify } from 'fastify';
import { Service, Inject } from "typedi";

import { ConfigManager} from "@root/components";
import { ArgsManager } from "@root/components/args";
import { AuthlibManager } from "@root/components/authlib";
import type { AuthProvider } from "@root/components/auth/providers";
import { VerifyManager } from "@root/components/secure/VerifyManager";

import genericRoutes from "./requests/generic";
import authlibRoutes from "./requests/authlib";
import releaseServerRoutes from "./requests/release-server";

@Service()
export class WebServerManager {

    constructor(
        @Inject("AuthProvider") private authProvider: AuthProvider,
        private readonly configManager: ConfigManager,
        private readonly argsManager: ArgsManager,
        private readonly authlibManager: AuthlibManager,
        private readonly verifyManager: VerifyManager,
    ) {
        const { host, port } = this.argsManager.args;
        const web = fastify({logger: false});

        web.register(genericRoutes, {
            disableListing: this.configManager.config.api.disableListing, 
            hideListing: this.configManager.config.api.hideListing
        });
        web.register(authlibRoutes, {
            configManager: this.configManager,
            authlibManager: this.authlibManager,
            authProvider: this.authProvider,
        });
        web.register(releaseServerRoutes, {
            verifyManager: this.verifyManager,
        });

        web.ready();
        web.listen({ port: Number(port), host: host });
    }
}
