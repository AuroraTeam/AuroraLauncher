export abstract class AbstractProvider {
    private type: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    abstract config: any

    constructor(type: string) {
        this.type = type
    }

    abstract emit(login: string, password: string, ip: string): string | boolean

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
