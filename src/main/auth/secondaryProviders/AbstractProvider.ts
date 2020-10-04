export abstract class AbstractSecondProvider {
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

export class SecondProviderConfig {
    type: string

    static getDefaults(): SecondProviderConfig {
        const defaults = new SecondProviderConfig()
        defaults.type = "none"
        return defaults
    }
}
