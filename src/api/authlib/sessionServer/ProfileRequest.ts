import { IncomingMessage, ServerResponse } from "node:http";
import { JsonHelper } from "../../../helpers/JsonHelper";
import UUIDHelper from "../../../helpers/UUIDHelper";
import { App } from "../../../LauncherServer";

import { AuthlibRequest } from "../AuthlibRequest";

export class ProfileRequest extends AuthlibRequest {
    method = "GET"
    url = "^/session/minecraft/profile/(?<uuid>\\w{32})(\\?unsigned=(true|false))?$"

    emit(req: IncomingMessage, res: ServerResponse): void {
        const uuid = req.url.substring(8).match(this.url).groups.uuid

        let user: any
        try {
            user = App.AuthManager.getAuthProvider().profile(UUIDHelper.getWithDashes(uuid))
        } catch (error) {
            return res.writeHead(400).end();
        }

        res.write(JsonHelper.toJSON({
            id: uuid,
            name: user.username,
            properties: [
                {
                    name: "textures",
                    value: Buffer.from(
                        JSON.stringify({
                            timestamp: Date.now(),
                            profileId: uuid,
                            profileName: user.username,
                            textures: {
                                SKIN: {
                                    url:
                                        "http://textures.minecraft.net/texture/7bc6395501fe9296091d995317d1f0578db073ce0e384b52ecd851c6e955aecf",
                                },
                            },
                        })
                    ).toString("base64"),
                },
            ],
        }));
        res.end()
    }
}
