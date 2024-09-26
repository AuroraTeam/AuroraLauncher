import { FastifyInstance } from "fastify";
import { AuthlibManager } from "@root/components/authlib";
import { ConfigManager } from "@root/components/config";
import type { AuthProvider } from "@root/components/auth/providers";
import { UUIDHelper } from "@root/utils";
import { JsonHelper } from "@aurora-launcher/core";

interface Options {
    configManager: ConfigManager,
    authlibManager: AuthlibManager,
    authProvider: AuthProvider,
}

interface JoinRequestDto {
    accessToken: string;
    selectedProfile: string;
    serverId: string;
}

interface QueryHasJoinedDto {
    username: string;
    serverId: string;
}

interface ParamsProfile{
    uuid: string;
}

interface QueryProfile{
    unsigned: boolean;
}

async function authlibRoutes(fastify: FastifyInstance, opts: Options) {

    fastify.get('/authlib', async (req, reply) => {
        reply.send({
            meta: {
                serverName: opts.configManager.config.projectName || "Aurora Launcher",
                implementationName: "aurora-launchserver",
                implementationVersion: "0.0.1",
            },
            skinDomains: opts.configManager.config.api.injector.skinDomains,
            signaturePublickey: opts.authlibManager.getPublicKey(),
        });
    });

    fastify.post<{Body: Array<string>}>('/authlib/api/profiles/minecraft', async (req, reply) => {
        reply.send(await opts.authProvider.profiles(req.body));
    });

    fastify.post<{Body: JoinRequestDto}>('/authlib/sessionserver/session/minecraft/join', async (req, reply) => {
        const status = await opts.authProvider.join(
            req.body.accessToken,
            UUIDHelper.getWithDashes(req.body.selectedProfile),
            req.body.serverId,
        );
        if (!status) return reply.code(400).send("ForbiddenOperationException: Invalid credentials.");
        reply.code(200);
    });

    fastify.get<{Querystring: QueryHasJoinedDto}>('/authlib/sessionserver/session/minecraft/hasJoined', async (req, reply) => {
        const user = await opts.authProvider.hasJoined(req.query.username, req.query.serverId);
        if (!user) return reply.code(400).send("ForbiddenOperationException: Invalid credentials.");

        const textures: any = {};
        if (user.skinUrl?.length > 0) {
            textures.SKIN = {
                url: user.skinUrl,
            };
            if (user.isAlex) {
                textures.SKIN.metadata = {
                    model: "slim",
                };
            }
        }
        if (user.capeUrl?.length > 0) {
            textures.CAPE = {
                url: user.capeUrl,
            };
        }
        const texturesValue = Buffer.from(
            JsonHelper.toJson({
                timestamp: Date.now(),
                profileId: user.userUUID,
                profileName: req.query.username,
                signatureRequired: true,
                textures,
            }),
        ).toString("base64");

        reply.send({
            id: user.userUUID,
            name: req.query.username,
            properties: [
                {
                    name: "textures",
                    value: texturesValue,
                    signature: opts.authlibManager.getSignature(texturesValue),
                },
            ],
        });
    });

    fastify.get<{Params: ParamsProfile, Querystring: QueryProfile}>('/authlib/sessionserver/session/minecraft/profile/:uuid', async (req, reply) => {
        const user = await opts.authProvider.profile(UUIDHelper.getWithDashes(req.params.uuid));
        if (!user) return reply.code(204).send("ForbiddenOperationException: Invalid credentials.");
        const textures: any = {};
        if (user.skinUrl?.length > 0) {
            textures.SKIN = {
                url: user.skinUrl,
            };
            if (user.isAlex) {
                textures.SKIN.metadata = {
                    model: "slim",
                };
            }
        }
        if (user.capeUrl?.length > 0) {
            textures.CAPE = {
                url: user.capeUrl,
            };
        }

        const texturesValue = Buffer.from(
            JsonHelper.toJson({
                timestamp: Date.now(),
                profileId: req.params.uuid,
                profileName: user.username,
                signatureRequired: req.query.unsigned,
                textures,
            }),
        ).toString("base64");
        const data: any = {
            id: req.params.uuid,
            name: user.username,
            properties: [
                {
                    name: "textures",
                    value: texturesValue,
                },
            ],
        };
        if (req.query.unsigned) data.properties[0].signature = this.authlibManager.getSignature(texturesValue);
        reply.send(data);
    });
}

export default authlibRoutes;