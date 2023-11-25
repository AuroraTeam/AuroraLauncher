import { ServerResponse } from "http";

import { JsonHelper } from "@aurora-launcher/core";

export class WebResponse {
    raw: ServerResponse;

    private constructor(response: ServerResponse) {
        this.raw = response;
    }

    /**
     * It sends an error message to the client.
     * @param [code=400] - The HTTP status code to send.
     * @param {string} [error] - The error code.
     * @param {string} [errorMessage] - The message that will be displayed to the user.
     */
    public error(code = 400, error?: string, errorMessage?: string): void {
        this.raw.statusCode = code;
        if (error) this.json({ error, errorMessage });
        else this.raw.end();
    }

    /**
     * It sends a JSON response to the client
     * @param {object} data - The data to be sent.
     */
    public json(data: object): void {
        this.raw.setHeader("Content-Type", "application/json; charset=utf-8");
        this.raw.end(JsonHelper.toJson(data));
    }

    static fromRaw(response: ServerResponse) {
        return new WebResponse(response);
    }
}
