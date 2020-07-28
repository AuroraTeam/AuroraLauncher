import { AbstractProvider } from "./AbstractProvider"

export class JsonAuthProvider extends AbstractProvider {
    config: Config

    constructor(config: Config) {
        super("json")
        this.config = config
    }

    emit(login: string, password: string, ip: string): string | boolean {
        return false
    }
}

export interface Config {
    url?: string
    secret?: string
}

interface Response {
    login?: string
    error?: string
}

interface Request {
    login: string
    password: string
    ip: string
    secret: string
}
