import * as mongoose from "mongoose";
import { Schema } from "mongoose";

export interface IHost extends mongoose.Document {
    _id: string;
    name: string;
}

export const HostSchema = new Schema({
    _id: { required: true, type: String, auto: false},
    name: { required: true, type: String }
});

const Host = mongoose.model<IHost>("Host", HostSchema, "hosts");

export default Host;
