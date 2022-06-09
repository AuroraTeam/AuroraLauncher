export abstract class AbstractCommand {
    public readonly name: string
    public readonly description: string
    public readonly category: Category
    public readonly usage: string

    // <arg> - опциональный аргумент
    // [arg] - обязательный аргумент

    protected constructor(name: string, description: string, category: Category, usage?: string) {
        this.name = name.toLowerCase()
        this.description = description
        this.category = category
        this.usage = usage
    }

    public abstract invoke(...args: string[]): void
}

export enum Category {
    AUTH = "auth",
    BASIC = "basic",
    UPDATES = "updates",
    COMMON = "common",
}
