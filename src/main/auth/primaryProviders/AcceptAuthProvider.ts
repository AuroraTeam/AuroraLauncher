import { v4, v5 } from "uuid"

import { wsResponseWithoutUUID } from "../../requests/types/AbstractRequest"
import { AbstractProvider } from "./AbstractProvider"

export class AcceptAuthProvider extends AbstractProvider {
    type = "accept"
    config: any // ?

    sessionsDB = new Map()

    emit(login: string): wsResponseWithoutUUID {
        const data = {
            login,
            userUUID: v5(login, "814f98b5-f66d-4456-87dc-f4eed8f6ca73"),
            accessToken: v4(),
        }

        this.sessionsDB.set(data.login, {
            ...data,
            serverID: undefined,
        })

        console.log(this.sessionsDB)

        return { data }
    }
}

export class Config {} // ?
