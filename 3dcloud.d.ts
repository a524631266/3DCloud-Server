declare module NodeJS {
    interface Global {
        logger: any;
    }
}

declare module Express {
    interface Response {
        success(data: any): void;
        error(message: string, status: number): void;
        exception(error: any): void;
    }
}