import { readFile } from "fs/promises";
import { resolve } from "path";

import fastifyMultipart from "@fastify/multipart";
import fastifyStatic, { ListOptionsHtmlFormat } from "@fastify/static";
import { Service } from "@freshgum/typedi";
import { LogHelper, StorageHelper } from "@root/helpers";
import fastify, { FastifyInstance } from "fastify";

import { ConfigManager } from "../config/ConfigManager";
import { LangManager } from "../langs/LangManager";
import { AbstractRequest } from "./requests/AbstractRequest";

@Service([ConfigManager, LangManager])
export class WebServerManager {
    #server!: FastifyInstance;

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
        const { ssl, useSSL, useHTTP2, disableListing, hideListing } =
            this.configManager.config.api;

        const config: { http2: boolean; https?: { cert: Buffer; key: Buffer }; http?: object } =
            {} as any;

        if (useHTTP2) {
            config.http2 = true;
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
            this.#server = fastify(config);
        } catch (error) {
            LogHelper.debug(error);
            LogHelper.fatal(this.langManager.getTranslate.WebServerManager.createServerError);
        }

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

            this.#server.register(fastifyMultipart);
        }
    }

    registerRequest(request: AbstractRequest) {
        this.#server.route({
            method: request.method,
            url: request.url,
            schema: request.schema!,
            handler: request.handler.bind(request),
        });
    }

    start() {
        const { host, port } = this.configManager.config.api;
        this.#server.listen({ host, port });
    }
}
