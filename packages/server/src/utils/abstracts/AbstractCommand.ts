export abstract class AbstractCommand {
    public readonly info: CommandInfo;

    constructor(info: CommandInfo) {
        this.info = info;
    }

    public abstract invoke(...args: string[]): void;
}

export interface CommandInfo {
    name: string;
    description: string;
    usage?: string;
    category: Category;
}

export enum Category {
    AUTH = "auth",
    BASIC = "basic",
    UPDATES = "updates",
    COMMON = "common",
}
