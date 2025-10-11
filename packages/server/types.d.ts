declare type PromiseOr<T> = Promise<T> | T;

declare namespace NodeJS {
    interface Process {
        pkg?: object;
    }

    interface ProcessEnv {
        AURORA_STORAGE_OVERRIDE?: string;
        AURORA_IS_DEV?: string;
        AURORA_IS_DEBUG?: string;
    }
}
