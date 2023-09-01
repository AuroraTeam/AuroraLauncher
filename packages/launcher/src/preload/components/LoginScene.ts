import { ipcRenderer } from 'electron';

import { EVENTS } from '../../common/channels';
import { UserData } from '../../common/types';

export default class LoginScene {
    static auth(login: string, password: string): Promise<UserData> {
        return ipcRenderer.invoke(EVENTS.SCENES.LOGIN.AUTH, login, password);
    }
}
