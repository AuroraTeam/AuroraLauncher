import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";

export interface AbstractWebRequest {
    readonly method: HTTPMethods | HTTPMethods[];
    readonly url: string;

    handler(req: FastifyRequest, rep: FastifyReply): Promise<any>;
}
