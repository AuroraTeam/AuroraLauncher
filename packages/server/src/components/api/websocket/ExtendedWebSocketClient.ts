import { WebSocketClient } from "aurora-rpc-server";

export interface ExtendedWebSocketClient extends WebSocketClient {
    isAuthed: boolean;

    isVerified: boolean;
    verifyToken?: string;
}
