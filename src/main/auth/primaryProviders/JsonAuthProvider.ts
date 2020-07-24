import { AbstractProvider } from "./AbstractProvider";
import axios, { AxiosInstance, AxiosResponse, Method } from 'axios';
import { METHODS } from "http";

export class JsonAuthProvider extends AbstractProvider {
    config: Config

    constructor(config: Config) {
        super("json")
        this.config = config
    }

    emit(login: string, password: string, ip: string): string | boolean {
        const response = axios.create({
            url: this.config.url,
            method: "POST",
            responseType: 'json',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        return false
    }
}

export interface Config {
    url?: string
    secret?: string
}

interface Response {
    login?: string
    error?: string
}

interface Request {
    login: string
    password: string
    ip: string
    secret: string
}