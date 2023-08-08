import { ipcRenderer } from 'electron';

import { EVENTS } from '../../common/channels';

export default class LoginScene {
    static auth(login: string, password: string): Promise<string> {
        return ipcRenderer.invoke(EVENTS.SCENES.LOGIN.AUTH, login, password);
    }
}
