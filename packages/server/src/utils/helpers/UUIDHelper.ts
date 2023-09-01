export class UUIDHelper {
    /**
     * It takes a uuid with dashes, and returns a with all dashes removed.
     * @param {string} uuid - The UUID to format.
     * @returns A string with all dashes removed.
     */
    static getWithoutDashes(uuid: string): string {
        return uuid.replace(/-/g, "");
    }

    /**
     * It takes a uuid without dashes, and returns a with dashes.
     * @param {string} uuid - The UUID to format.
     * @returns A string with dashes inserted in the appropriate places.
     */
    static getWithDashes(uuid: string): string {
        return uuid.replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, "$1-$2-$3-$4-$5");
    }
}
