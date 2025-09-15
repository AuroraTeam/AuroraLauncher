export const UPDATES_METHOD = "/updates";

export interface UpdatesRequestData {
    dir: string;
}

export interface HashedFile {
    path: string;
    size: number;
    sha1: string;
}

export type UpdatesResponseData = HashedFile[];
