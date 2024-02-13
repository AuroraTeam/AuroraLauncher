export class APIError extends Error {
    private code: number

    constructor(code?: number, message?: string) {
        super(message || "Unknown response error")
        this.code = code || 0
        this.name = this.constructor.name
    }

    toString() {
        return `${this.name}(${this.code}): ${this.message}`
    }

    toJSON() {
        return {
            code: this.code,
            message: this.message,
        }
    }
}
