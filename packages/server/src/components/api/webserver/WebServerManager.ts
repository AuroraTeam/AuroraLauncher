import { fastify } from 'fastify';
import { Service, Inject } from "typedi";
import { readFileSync, existsSync } from "fs";

import { ConfigManager, LangManager} from "@root/components";
import { ArgsManager } from "@root/components/args";
import { AuthlibManager } from "@root/components/authlib";
import type { AuthProvider } from "@root/components/auth/providers";
import { VerifyManager } from "@root/components/secure/VerifyManager";
import { LogHelper } from "@root/utils";

import genericRoutes from "./requests/generic";
import authlibRoutes from "./requests/authlib";
import releaseServerRoutes from "./requests/release-server";

@Service()
export class WebServerManager {

    constructor(
        @Inject("AuthProvider") private authProvider: AuthProvider,
        private langManager: LangManager,
        private readonly configManager: ConfigManager,
        private readonly argsManager: ArgsManager,
        private readonly authlibManager: AuthlibManager,
        private readonly verifyManager: VerifyManager,
    ) {
        const { host, port } = this.argsManager.args;
        let options = null;
        if (this.configManager.config.api.useSSL) {
            if (!existsSync(configManager.config.api.ssl.cert)) {
                LogHelper.fatal(langManager.getTranslate.WebSocketManager.certNotFound);
            }
            if (!existsSync(configManager.config.api.ssl.key)) {
                LogHelper.fatal(langManager.getTranslate.WebSocketManager.keyNotFound);
            }
            if (!existsSync(configManager.config.api.ssl.root_cert)) {
                LogHelper.fatal(langManager.getTranslate.WebSocketManager.certNotFound);
            }
            options = {
                ca: readFileSync(this.configManager.config.api.ssl.root_cert),
                key: readFileSync(this.configManager.config.api.ssl.key),
                cert: readFileSync(this.configManager.config.api.ssl.cert)
            };
        }
        let logger = false
        if (process.argv.includes("--debug") || process.env.AURORA_IS_DEBUG === "true" || process.argv.includes("--dev") || process.env.AURORA_IS_DEV === "true")
            logger = true
        const web = fastify({logger, https: options});

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
