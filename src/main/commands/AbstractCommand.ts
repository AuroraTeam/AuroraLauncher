export abstract class AbstractCommand {
    abstract name: string
    abstract description: string
    abstract category: string
    abstract usage: string

    constructor() {}

    abstract emit(...args: Array<string>): void

    public getName(): string {
        return this.name
    }

    public getDescription(): string {
        return this.description
    }

    public getCategory(): string {
        return this.category
    }

    public getUsage(): string {
        return this.usage
    }
}
