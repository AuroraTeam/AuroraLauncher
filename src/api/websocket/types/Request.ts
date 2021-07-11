export type RequestData = object

export interface Request {
    type: string
    data: RequestData
}

export interface wsRequest extends Request {
    uuid: string
}
