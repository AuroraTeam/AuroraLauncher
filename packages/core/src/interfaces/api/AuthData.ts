export interface AuthRequestData {
    login: string
    password: string
}

export interface AuthResponseData {
    username: string
    userUUID: string
    accessToken: string
}
