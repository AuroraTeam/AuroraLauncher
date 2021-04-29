export default class UUIDHelper {
    /**
     * @param uuid UUID with dashes
     * @returns UUID without dashes
     */
    static getWithoutDashes(uuid: string): string {
        return uuid.replace(/-/g, "");
    }

    /**
     * @param uuid UUID without dashes
     * @returns UUID with dashes
     */
    static getWithDashes(uuid: string): string {
        return uuid.replace(
            /(.{8})(.{4})(.{4})(.{4})(.{12})/,
            "$1-$2-$3-$4-$5"
        );
    }
}
