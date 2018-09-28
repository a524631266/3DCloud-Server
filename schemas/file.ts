import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { Socket } from "../socket";

export interface IFile extends mongoose.Document {
    _id: string;
    name: string;
    date_added: string;
}

export const FileSchema = new Schema({
    "_id": { "required": true, "type": String, "auto": false },
    "name": { "required": true, "type": String },
    "date_added": { "required": true, "type": String }
});

FileSchema.post("save", (device) => {
    Socket.documentSaved("File", device);
});

FileSchema.post("findOneAndUpdate", (device) => {
    Socket.documentSaved("File", device);
});

FileSchema.post("remove", (device) => {
    Socket.documentRemoved("File", device);
});

FileSchema.post("findOneAndRemove", (device) => {
    Socket.documentRemoved("File", device);
});

const File = mongoose.model<IFile>("File", FileSchema, "files");

export default File;
