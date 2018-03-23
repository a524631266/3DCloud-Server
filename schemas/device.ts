import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import { IHost } from "./host";
import Printer from "./printer";

export interface IDevice extends mongoose.Document {
    _id: string;
    host: IHost;
}

export const DeviceSchema = new Schema({
    _id: { required: true, type: String, auto: false },
    host: { required: true, type: String, ref: "Host" }
});

DeviceSchema.post("remove", async (doc) => {
    await Printer.find({device: doc._id}).remove();
});

const Device = mongoose.model<IDevice>("Device", DeviceSchema, "devices");

export default Device;
