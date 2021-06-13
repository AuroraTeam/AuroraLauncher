/**
 * AuroraLauncher LauncherServer - Server for AuroraLauncher
 * Copyright (C) 2020 - 2021 AuroraTeam

 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.

 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { IncomingMessage } from "http"

import { JsonHelper } from "../../../../../helpers/JsonHelper"
import UUIDHelper from "../../../../../helpers/UUIDHelper"
import { App } from "../../../../../LauncherServer"
import { CustomServerResponse } from "../../../WebRequestManager"
import { AbstractRequest } from "../../AbstractRequest"

export class HasJoinedRequest extends AbstractRequest {
    method = "GET"
    url = /^\/authlib\/session\/minecraft\/hasJoined/

    async emit(req: IncomingMessage, res: CustomServerResponse): Promise<void> {
        const data = this.parseQuery(req.url)
        if (this.isEmptyQuery(data)) res.writeStatus(400)

        const username = data.get("username")
        const serverId = data.get("serverId")

        if (this.isInvalidValue(username) || this.isInvalidValue(serverId)) return res.writeStatus(400)

        // TODO
        // Если IP указан
        const ip = data.get("ip")
        if (ip && this.isInvalidValue(ip)) {
            return res.writeStatus(400)
        }

        let user
        try {
            user = await App.AuthManager.getAuthProvider().hasJoined(username, serverId)
        } catch (error) {
            return res.writeStatus(400)
        }

        const userUUID = UUIDHelper.getWithoutDashes(user.userUUID)

        const textures: any = {}
        if (user.skinUrl?.length > 0) {
            textures.SKIN = {
                url: user.skinUrl,
            }
        }
        if (user.capeUrl?.length > 0) {
            textures.CAPE = {
                url: user.capeUrl,
            }
        }

        const texturesValue = Buffer.from(
            JSON.stringify({
                timestamp: Date.now(),
                profileId: userUUID,
                profileName: username,
                signatureRequired: true,
                textures,
            })
        ).toString("base64")

        res.write(
            JsonHelper.toJSON({
                id: userUUID,
                name: username,
                properties: [
                    {
                        name: "textures",
                        value: texturesValue,
                        signature: App.AuthlibManager.getSignature(texturesValue), // Ох как же тебя жмыхнуло
                    },
                ],
            })
        )
        res.end()
    }
}
