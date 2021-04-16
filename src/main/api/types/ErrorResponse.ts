export interface ErrorResponse {
    code: number
    message: string
}

export interface wsErrorResponse extends ErrorResponse {
    uuid: string
}
