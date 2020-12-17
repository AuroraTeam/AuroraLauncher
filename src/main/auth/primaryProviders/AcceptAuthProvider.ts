import { v4 } from "uuid"

import { wsResponseWithoutUUID } from "../../requests/types/AbstractRequest"
import { AbstractProvider } from "./AbstractProvider"

export class AcceptAuthProvider extends AbstractProvider {
    type = "accept"
    config: any

    emit(login: string): wsResponseWithoutUUID {
        return {
            data: {
                login,
                userUUID: v4(),
                accessToken: v4(),
            },
        }
    }
}

export class Config {}
