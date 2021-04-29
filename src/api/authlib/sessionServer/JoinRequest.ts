import { IncomingMessage, ServerResponse } from "node:http";
import { AuthlibRequest } from "../AuthlibRequest";

export class JoinRequest extends AuthlibRequest {
    method = "POST"
    url = "/session/minecraft/join"

    emit(req: IncomingMessage, res: ServerResponse): void {}
}
