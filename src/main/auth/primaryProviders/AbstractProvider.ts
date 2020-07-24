
export abstract class AbstractProvider {
    private type: string
    abstract config: any

    constructor(type: string) {
        this.type = type
    }

    abstract emit(login: string, password: string, ip: string): string | boolean

    public getType(): string {
        return this.type;
    }
}

export class PrimaryProviderConfig {
    type: string
} 