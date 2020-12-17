import { wsErrorResponseWithoutUUID, wsResponseWithoutUUID } from "../../requests/types/AbstractRequest"
export abstract class AbstractProvider {
    protected type: string
    abstract config: any

    abstract emit(login: string, password: string, ip: string): wsResponseWithoutUUID | wsErrorResponseWithoutUUID

    public getType(): string {
        return this.type
    }
}

export class PrimaryProviderConfig {
    type: string

    static getDefaults(): PrimaryProviderConfig {
        const defaults = new PrimaryProviderConfig()
        defaults.type = "none"
        return defaults
    }
}
