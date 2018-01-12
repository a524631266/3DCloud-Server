import { ApiEndpoint } from "./api-endpoint";

export abstract class ApiEndpointCollection {
    public abstract getEndpoints(): ApiEndpoint[];
}
