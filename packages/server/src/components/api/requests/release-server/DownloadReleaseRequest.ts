import { createWriteStream } from "fs";
import { rm } from "fs/promises";
import { resolve } from "path";
import { pipeline } from "stream/promises";

import { Service } from "@freshgum/typedi";
import { VerifyManager } from "@root/components/secure/VerifyManager";
import { StorageHelper } from "@root/helpers/StorageHelper";
import { FastifyReply, FastifyRequest, FastifySchema } from "fastify";

import { AbstractRequest } from "../AbstractRequest";
import { TokenManager } from "./Token";

@Service([VerifyManager, TokenManager])
export class DownloadReleaseRequest implements AbstractRequest {
    method = "POST";
    url = "/release/upload/";
    schema?: FastifySchema = {
        querystring: {
            type: "object",
            required: ["encryptedToken"],
            properties: {
                encryptedToken: { type: "string" },
            },
        },
    };

    constructor(
        private verifyManager: VerifyManager,
        private tokenManager: TokenManager,
    ) {}

    async handler(
        req: FastifyRequest<{ Querystring: { encryptedToken: string } }>,
        rep: FastifyReply,
    ) {
        const { encryptedToken } = req.query;
        let decryptedToken: string;

        try {
            decryptedToken = this.verifyManager.decryptToken(encryptedToken);
        } catch {
            rep.code(400);
            return {
                error: "Bad request",
                message: "Invalid decryptedToken",
            };
        }

        if (decryptedToken !== this.tokenManager.getToken()) {
            rep.code(403);
            return {
                error: "Forbidden",
                message: "Invalid decryptedToken",
            };
        }

        const data = await req.file({ limits: { fileSize: 314572800 } }); // 300MB
        if (!data) {
            rep.code(400);
            return {
                error: "Bad request",
                message: "No file uploaded",
            };
        }

        const filePath = resolve(StorageHelper.releaseDir, data.fieldname);

        const stream = createWriteStream(filePath);
        await pipeline(data.file, stream);

        if (data.file.truncated) {
            await rm(filePath);
            return req.server.multipartErrors.RequestFileTooLargeError();
        }
        return;
    }
}
