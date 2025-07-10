import { FastifyReply, FastifyRequest, FastifySchema, HTTPMethods } from "fastify";

export interface AbstractRequest {
    readonly method: HTTPMethods | HTTPMethods[];
    readonly url: string;
    readonly schema?: FastifySchema;

    handler(req: FastifyRequest, rep: FastifyReply): PromiseOr<any>;
}
