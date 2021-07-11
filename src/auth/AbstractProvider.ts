export abstract class AbstractProvider {
    protected static type: string

    public static getType(): string {
        return this.type
    }
}
