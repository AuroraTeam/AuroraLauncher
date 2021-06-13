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

export class ProfileRequest extends AbstractRequest {
    method = "GET"
    url = /^\/authlib\/session\/minecraft\/profile\/(?<uuid>\w{32})(\?unsigned=(true|false))?$/

    async emit(req: IncomingMessage, res: CustomServerResponse): Promise<void> {
        const matches = req.url.match(this.url)
        const uuid = matches.groups.uuid
        const signed = matches[3] === "false"

        let user
        try {
            user = await App.AuthManager.getAuthProvider().profile(UUIDHelper.getWithDashes(uuid))
        } catch (error) {
            return res.writeStatus(400)
        }

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

        let texturesValue: any = {
            timestamp: Date.now(),
            profileId: uuid,
            profileName: user.username,
            textures,
        }

        const data: any = {
            id: uuid,
            name: user.username,
            properties: [
                {
                    name: "textures",
                    value: "",
                },
            ],
        }

        if (signed) texturesValue.signatureRequired = true
        texturesValue = Buffer.from(JSON.stringify(texturesValue))
        data.properties[0].value = texturesValue.toString("base64")
        if (signed) data.properties[0].signature = App.AuthlibManager.getSignature(texturesValue)
        res.write(JsonHelper.toJSON(data))
        res.end()
    }
}
