export abstract class AbstractCommand {
    public readonly info: commandOptions

    protected constructor(options: commandOptions) {
        this.info = {
            name: options.name,
            description: options.description,
            usage: options.usage,
            category: options.category,
        }
    }

    public abstract invoke(...args: string[]): void
}

export interface commandOptions {
    name: string
    description: string
    usage: string
    category: Category
}

export enum Category {
    AUTH = "auth",
    BASIC = "basic",
    UPDATES = "updates",
    COMMON = "common",
}
