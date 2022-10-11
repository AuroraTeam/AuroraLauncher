// TODO А нужно ли нам это?
export class ValidationHelper {
    /**
     * It returns true if the username is between 4 and 16 characters long and contains only letters,
     * numbers, and underscores
     * @param {string} username - The username to validate
     * @returns A boolean value
     */
    static username(username: string): boolean {
        return this.raw(username, "^[A-Za-z0-9_]{4,16}$")
    }

    /**
     * It checks if the email is valid.
     * @param {string} email - The email address to validate
     * @returns A boolean value.
     */
    static email(email: string): boolean {
        return this.raw(
            email,
            "^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$"
        )
    }

    /**
     * It checks if the string is a valid UUID.
     * @param {string} uuid - The string to be validated
     * @returns A boolean value.
     */
    static uuidV4(uuid: string): boolean {
        return this.raw(
            uuid,
            "^[0-9A-Za-z]{8}-[0-9A-Za-z]{4}-4[0-9A-Za-z]{3}-[89ABab][0-9A-Za-z]{3}-[0-9A-Za-z]{12}$"
        )
    }

    /**
     * It returns true if the string str matches the regular expression pattern
     * @param {string} str - The string to be tested.
     * @param {string} pattern - The pattern to match against.
     * @returns A boolean value
     */
    static raw(str: string, pattern: string): boolean {
        return new RegExp(pattern).test(str)
    }
}
