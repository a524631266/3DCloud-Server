import * as mongoose from "mongoose";
import { Schema } from "mongoose";
import Device from "./device";

export interface IHost extends mongoose.Document {
    _id: string;
    name: string;
}

export const HostSchema = new Schema({
    _id: { required: true, type: String, auto: false},
    name: { required: true, type: String }
});

HostSchema.post("remove", async (doc) => {
    await Device.find({host: doc._id}).remove();
});

const Host = mongoose.model<IHost>("Host", HostSchema, "hosts");

export default Host;
