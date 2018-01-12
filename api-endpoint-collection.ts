import { ApiEndpoint } from "./api-endpoint";

export abstract class ApiEndpointCollection {
    public constructor() { }

    public abstract getEndpoints(): ApiEndpoint[];
}
