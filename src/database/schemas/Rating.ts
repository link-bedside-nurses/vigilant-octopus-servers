import { prop } from "@typegoose/typegoose";

export class Rating {
  @prop({ required: true, ref: "User" })
  userId!: string;

  @prop({ type: String, required: false })
  description?: string;

  @prop({ type: Number, required: false })
  value?: number;
}
