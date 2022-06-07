export abstract class AbstractCommand {
    public conf: commandOptions

    // <arg> - опциональный аргумент
    // [arg] - обязательный аргумент

    protected constructor(options: commandOptions) {
        this.conf = {
            name: options.name,
            category: options.category,
            description: options.description || "Информация не указана.",
            usage: options.usage || "",
        }
    }

    public abstract invoke(...args: string[]): void
}

export enum Category {
    AUTH = "auth",
    BASIC = "basic",
    UPDATES = "updates",
    COMMON = "common",
}

interface commandOptions {
    name: string
    category: Category
    description?: string
    usage?: string
}
