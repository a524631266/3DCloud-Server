import * as mongoose from "mongoose";
import { Schema } from "mongoose";

export interface IFile extends mongoose.Document {
    _id: string;
    name: string;
    date_added: string;
}

export const FileSchema = new Schema({
    _id: { required: true, type: String, auto: false },
    name: { required: true, type: String },
    date_added: { required: true, type: String }
});

const File = mongoose.model<IFile>("File", FileSchema, "files");

export default File;
