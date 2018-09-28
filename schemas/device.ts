import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { Socket } from "../socket";
import { IHost } from "./host";

export interface IDevice extends mongoose.Document {
    _id: string;
    host: IHost;
}

export const DeviceSchema = new Schema({
    "_id": { "required": true, "type": String, "auto": false },
    "host": { "required": true, "type": String, "ref": "Host" }
});

DeviceSchema.post("save", (device) => {
    Socket.documentSaved("Device", device);
});

DeviceSchema.post("findOneAndUpdate", (device) => {
    Socket.documentSaved("Device", device);
});

DeviceSchema.post("remove", (device) => {
    Socket.documentRemoved("Device", device);
});

DeviceSchema.post("findOneAndRemove", (device) => {
    Socket.documentRemoved("Device", device);
});

const Device = mongoose.model<IDevice>("Device", DeviceSchema, "devices");

export default Device;
