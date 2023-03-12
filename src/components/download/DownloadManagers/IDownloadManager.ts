export interface IDownloadManager {
    /**
     * Скачивание клиента с зеркала Mojang
     * @param clientVer - Версия клиента
     * @param instanceName - Название истанции
     */
    downloadClient(clientVer: string, instanceName: string): Promise<any>

    /**
     * Скачивание клиена с зеркала Mojang
     * @param assetsVer - Версия клиента
     */
    downloadAssets(assetsVer: string): Promise<any>
}
