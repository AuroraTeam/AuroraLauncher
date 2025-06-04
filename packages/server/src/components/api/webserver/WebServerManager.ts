import { readFile } from "fs/promises";
import { resolve } from "path";

import fastifyStatic, { ListOptionsHtmlFormat } from "@fastify/static";
import { Service } from "@freshgum/typedi";
import { LogHelper, StorageHelper } from "@root/utils";
import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { ConfigManager } from "../../config";
import { LangManager } from "../../langs";

@Service([ConfigManager, LangManager])
export class WebServerManager {
    #server: FastifyInstance;

    constructor(
        private readonly configManager: ConfigManager,
        private readonly langManager: LangManager,
    ) {
        this.init();
    }

    public get server(): FastifyInstance {
        return this.#server;
    }

    private async init() {
        const { ssl, useSSL, useHTTP2 } = this.configManager.config.api;

        const config: { http2?: boolean; https?: { cert?: Buffer; key?: Buffer } } = {};

        if (useHTTP2) {
            if (useSSL) {
                config.http2 = true;
            } else {
                LogHelper.warn(this.langManager.getTranslate.WebServerManager.http2Ignore);
            }
        }

        if (useSSL) {
            config.https = {
                cert: await readFile(resolve(StorageHelper.storageDir, ssl.cert)).catch(() =>
                    LogHelper.fatal(this.langManager.getTranslate.WebServerManager.certNotFound),
                ),
                key: await readFile(resolve(StorageHelper.storageDir, ssl.key)).catch(() =>
                    LogHelper.fatal(this.langManager.getTranslate.WebServerManager.keyNotFound),
                ),
            };
        }

        try {
            this.#server = fastify(<unknown>config);
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.fatal(this.langManager.getTranslate.WebServerManager.createServerError);
        }

        this.initListing();
        this.#server.get("/", (req, rep) => this.redirectListener(req, rep));
    }

    private initListing() {
        const { disableListing, hideListing } = this.configManager.config.api;
        if (!disableListing) {
            let list: boolean | ListOptionsHtmlFormat = false;

            if (!hideListing) {
                list = {
                    format: "html",
                    render: (dirs, files) =>
                        `<!DOCTYPE html><html><head><style>*{font-family:monospace;font-size:14px}</style></head><body>${dirs.map((dir) => `<a href="${dir.href}">${dir.name}</a>`).join("<br/>")}${files.map((file) => `<a href="${file.href}">${file.name}</a>`).join("<br/>")}</body></html>`,
                };
            }

            this.#server.register(fastifyStatic, {
                root: StorageHelper.gameFilesDir,
                prefix: "/files",
                index: false,
                redirect: true,
                list,
            });
        }
    }

    private redirectListener(req: FastifyRequest, rep: FastifyReply) {
        if (req.headers["user-agent"]?.startsWith("Java")) {
            rep.header("X-Authlib-Injector-API-Location", "/authlib");
            return rep.send();
        }

        const { useSSL } = this.configManager.config.api;
        rep.redirect(`http${useSSL ? "s" : ""}://${req.headers.host}/files/`, 301);
        rep.send();
    }

    start() {
        const { host, port } = this.configManager.config.api;
        this.server.listen({ host, port });
    }
}
