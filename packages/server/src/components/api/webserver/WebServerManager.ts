import fs from "fs";
import { readdir, stat } from "fs/promises";
import http from "http";
import https from "https";
import { join, resolve } from "path";

import { ConfigManager } from "@root/components/config";
import { LangManager } from "@root/components/langs";
import { LogHelper, StorageHelper } from "@root/utils";

import { WebRequestManager } from "./WebRequestManager";

export class WebServerManager {
    private webServer: http.Server | https.Server;
    private requestsManager = new WebRequestManager();

    public get server() {
        return this.webServer;
    }

    constructor(
        private readonly configManager: ConfigManager,
        private readonly langManager: LangManager
    ) {
        if (this.webServer) throw new Error("The web server has already been created");

        const { ssl, useSSL } = this.configManager.config.api;

        if (!useSSL) {
            this.webServer = http.createServer(
                (req: http.IncomingMessage, res: http.ServerResponse) =>
                    this.requestListener(req, res)
            );
            return;
        }

        const certPath = resolve(StorageHelper.storageDir, ssl.cert);
        const keyPath = resolve(StorageHelper.storageDir, ssl.key);

        if (!fs.existsSync(certPath)) {
            LogHelper.fatal(this.langManager.getTranslate.WebSocketManager.certNotFound);
        }
        if (!fs.existsSync(keyPath)) {
            LogHelper.fatal(this.langManager.getTranslate.WebSocketManager.keyNotFound);
        }

        this.webServer = https.createServer(
            {
                cert: fs.readFileSync(certPath),
                key: fs.readFileSync(keyPath),
            },
            (req: http.IncomingMessage, res: http.ServerResponse) => this.requestListener(req, res)
        );
    }

    /**
     * It takes a request and a response, and if the request is for a file, it returns a file listing,
     * otherwise it passes the request and response to the requests manager
     * @param req - http.IncomingMessage - This is the request object that the server receives.
     * @param res - http.ServerResponse - The response object that will be sent back to the client.
     * @returns The response object
     */
    private requestListener(req: http.IncomingMessage, res: http.ServerResponse) {
        if (req.url.startsWith("/files")) return this.fileListing(req.url, res);
        this.requestsManager.getRequest(req, res);
    }

    private async fileListing(url: string, res: http.ServerResponse) {
        const { disableListing, hideListing } = this.configManager.config.api;
        if (disableListing) return res.writeHead(404).end("Not found!");

        if (url.includes("?")) url = url.split("?")[0];
        url = url.replace(/\/{2,}/g, "/").slice(6);
        if (url.at(-1) === "/") url = url.slice(0, -1);

        const path = join(StorageHelper.gameFilesDir, url);

        // Защита от выхода из директории
        if (!path.startsWith(StorageHelper.gameFilesDir)) {
            return res.writeHead(400).end();
        }

        let stats;
        try {
            stats = await stat(path);
        } catch (error) {
            if (error.code === "ENOENT") {
                res.writeHead(404).end("Not found!");
            } else {
                LogHelper.warn(error);
                res.writeHead(500).end();
            }
            return;
        }

        if (stats.isFile()) {
            return fs.createReadStream(path).pipe(res);
        }

        if (hideListing) return res.writeHead(404).end();

        try {
            const dirListing = await readdir(path);

            if (url.length !== 0) dirListing.unshift("..");
            res.write(
                "<!DOCTYPE html><html><head><style>*{font-family:monospace;font-size:14px}</style></head><body>"
            );
            res.write(
                dirListing.map((el) => `<a href="/files${url}/${el}">${el}</a>`).join("<br>")
            );
            res.end("</body></html>");
        } catch (error) {
            LogHelper.warn(error);
            res.writeHead(500).end();
        }
    }
}
