export interface Request {
    type: string
    data: object
}

export interface wsRequest extends Request {
    uuid: string
}
