export abstract class AbstractCommand {
    abstract name: string
    abstract description: string
    abstract category: Category
    abstract usage: string

    abstract invoke(...args: Array<string>): void

    public getName(): string {
        return this.name
    }

    public getDescription(): string {
        return this.description
    }

    public getCategory(): Category {
        return this.category
    }

    public getUsage(): string {
        return this.usage
    }
}

export enum Category {
    AUTH = "auth",
    BASIC = "basic",
    UPDATES = "updates",
    COMMON = "common",
}
