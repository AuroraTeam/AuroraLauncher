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
