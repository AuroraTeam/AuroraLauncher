import { FastifyInstance } from "fastify";
import multipart from '@fastify/multipart';
import { writeFileSync } from "fs";
import { resolve } from "path";
import { SecureHelper } from "@root/utils";
import { StorageHelper } from "@root/utils/helpers/StorageHelper";
import { VerifyManager } from "@root/components/secure/VerifyManager";

interface Options {
    verifyManager: VerifyManager
}

interface IQuerystring {
    encryptedToken:string
}

async function relaseServerRoutes(fastify: FastifyInstance, opts: Options) {
    const token = SecureHelper.generateRandomToken(32)

    fastify.register(multipart);

    fastify.get('/release/get_token', async (req, reply) => {
        const encryptedToken = opts.verifyManager.encryptToken(token)
        reply.send({token: encryptedToken});
    });

    fastify.post<{Querystring: IQuerystring}>('/release/upload', async (req, reply) => {
        const decryptedToken = opts.verifyManager.decryptToken(req.query.encryptedToken)
        if ( decryptedToken == token){
            const data = await req.file({ limits: { fileSize: 314572800 } }) // 300MB
            writeFileSync(resolve(StorageHelper.releaseDir, data.fieldname), await data.toBuffer())
            reply.status(200)
        }
        else reply.status(500).send("Invalid token")
    });
}

export default relaseServerRoutes;