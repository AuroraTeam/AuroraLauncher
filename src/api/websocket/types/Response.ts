export type ResponseData = object

export interface Response {
    data: ResponseData
}

export interface wsResponse extends Response {
    uuid: string
}
