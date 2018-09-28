import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { Socket } from "../socket";

export interface IHost extends mongoose.Document {
    _id: string;
    name: string;
}

export const HostSchema = new Schema({
    "_id": { "required": true, "type": String, "auto": false},
    "name": { "required": true, "type": String }
});

HostSchema.post("save", (device) => {
    Socket.documentSaved("Host", device);
});

HostSchema.post("findOneAndUpdate", (device) => {
    Socket.documentSaved("Host", device);
});

HostSchema.post("remove", (device) => {
    Socket.documentRemoved("Host", device);
});

HostSchema.post("findOneAndRemove", (device) => {
    Socket.documentRemoved("Host", device);
});

const Host = mongoose.model<IHost>("Host", HostSchema, "hosts");

export default Host;
