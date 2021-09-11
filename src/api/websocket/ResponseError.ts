import { ErrorResponse } from "./types/ErrorResponse"

/**
 * ResponseError
 */
export class ResponseError extends Error {
    private code: number

    constructor(code?: number, message?: string) {
        super(message || "Unknown response error")
        this.code = code || 100
        this.name = this.constructor.name
    }

    toJSON(): ErrorResponse {
        return {
            code: this.code,
            message: this.message,
        }
    }
}
