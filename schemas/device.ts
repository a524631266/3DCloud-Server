import * as mongoose from "mongoose";
import { Schema } from "mongoose";

export interface IDevice extends mongoose.Document {
    _id: string;
    host_id: string;
}

export const DeviceSchema = new Schema({
    _id: { required: true, type: String, auto: false },
    host_id: { required: true, type: String }
});

const Device = mongoose.model<IDevice>("Device", DeviceSchema, "devices");

export default Device;
