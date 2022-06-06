export abstract class AbstractCommand {
    private readonly name: string
    private readonly description: string
    private readonly category: Category
    private readonly usage: string

    // <arg> - опциональный аргумент
    // [arg] - обязательный аргумент

    protected constructor(name: string, description: string, category: Category, usage?: string) {
        this.name = name.toLowerCase()
        this.description = description
        this.category = category
        this.usage = usage
    }

    public abstract invoke(...args: string[]): void

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
