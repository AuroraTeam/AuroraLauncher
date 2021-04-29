import { IncomingMessage, ServerResponse } from "node:http";
import { AuthlibRequest } from "../AuthlibRequest";

export class HasJoinedRequest extends AuthlibRequest {
    method = "GET"
    url = "/session/minecraft/hasJoined"

    emit(req: IncomingMessage, res: ServerResponse): void {}
}
