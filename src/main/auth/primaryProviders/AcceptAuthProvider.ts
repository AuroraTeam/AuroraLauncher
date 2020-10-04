/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AbstractProvider } from "./AbstractProvider"

export class AcceptAuthProvider extends AbstractProvider {
    config: any

    constructor(config: any) {
        super("accept")
    }

    emit(login: string, password: string, ip: string): string | boolean {
        return login
    }
}

export class Config {}
