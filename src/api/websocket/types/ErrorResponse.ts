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

export interface ErrorResponse {
    code: number
    message: string
}

export interface wsErrorResponse extends ErrorResponse {
    uuid: string
}
