export const EVENTS = {
    WINDOW: {
        HIDE: 'window:hide',
        CLOSE: 'window:close',
    },
    SCENES: {
        LOGIN: {
            AUTH: 'scenes:login:auth',
        },
        SERVERS_LIST: {
            GET_SERVERS: 'scenes:serversList:getServers',
            SELECT_SERVER: 'scenes:serversList:selectServer',
        },
        SERVER_PANEL: {
            GET_PROFILE: 'scenes:serverPanel:getProfile',
            GET_SERVER: 'scenes:serverPanel:getServer',
            START_GAME: 'scenes:serverPanel:startGame',
        },
    },
};
