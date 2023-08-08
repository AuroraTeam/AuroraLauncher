import { ipcRenderer } from 'electron';

import { API_AUTH_HANDLER } from '../../common/channels';

export default class LoginScene {
    static auth(login: string, password: string): Promise<string> {
        return ipcRenderer.invoke(API_AUTH_HANDLER, login, password);
    }
}
