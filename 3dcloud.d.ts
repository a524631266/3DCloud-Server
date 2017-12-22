/* tslint:disable */
declare module NodeJS {
    // noinspection JSUnusedGlobalSymbols
    interface Global {
        logger: any;
    }
}

declare module Express {
    // noinspection JSUnusedGlobalSymbols
    interface Response {
        success(data: any): void;
        error(message: string, status: number): void;
        exception(error: any): void;
    }
}