import { ipcRenderer } from 'electron';

import { API_GET_PROFILE_HANDLER } from '../../common/channels';

export default class ServerPanel {
    static getProfile(uuid: string): Promise<any> {
        return ipcRenderer.invoke(API_GET_PROFILE_HANDLER, uuid);
    }
}
