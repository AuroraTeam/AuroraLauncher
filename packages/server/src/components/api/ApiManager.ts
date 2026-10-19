import { readFile } from "fs/promises";
import { resolve } from "path";

import fastifyMultipart from "@fastify/multipart";
import fastifyStatic, { ListOptionsHtmlFormat } from "@fastify/static";
import { Service } from "@freshgum/typedi";
import { StorageHelper } from "@root/helpers";
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
    ) {}

    public get server(): FastifyInstance {
        if (!this.#server) throw new Error("Web server has not been initialized");
        return this.#server;
    }

    async init(): Promise<void> {
        const { ssl, useSSL, useHTTP2, disableListing, hideListing } =
            this.configManager.config.api;

        const config: { http2: boolean; https?: { cert: Buffer; key: Buffer }; http?: object } =
            {} as any;

        if (useHTTP2) {
            config.http2 = true;
        }

        if (useSSL) {
            config.https = {
                cert: await readFile(resolve(StorageHelper.storageDir, ssl.cert)).catch(
                    (error: unknown) => {
                        throw new Error(
                            this.langManager.getTranslate.WebServerManager.certNotFound,
                            { cause: error },
                        );
                    },
                ),
                key: await readFile(resolve(StorageHelper.storageDir, ssl.key)).catch(
                    (error: unknown) => {
                        throw new Error(
                            this.langManager.getTranslate.WebServerManager.keyNotFound,
                            { cause: error },
                        );
                    },
                ),
            };
        }

        try {
            this.#server = fastify(config);
        } catch (error) {
            throw new Error(this.langManager.getTranslate.WebServerManager.createServerError, {
                cause: error,
            });
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
        this.server.route({
            method: request.method,
            url: request.url,
            schema: request.schema!,
            handler: request.handler.bind(request),
        });
    }

    async start(): Promise<void> {
        const { host, port } = this.configManager.config.api;
        await this.server.listen({ host, port });
    }

    async stop(): Promise<void> {
        await this.#server?.close();
    }
}
