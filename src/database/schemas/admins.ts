import { modelOptions, pre, prop } from "@typegoose/typegoose";
import argon from "argon2";

@modelOptions({ schemaOptions: { _id: false, versionKey: false } })
class Avatar {
  @prop({ type: String })
  url!: string;

  @prop({ type: String })
  publicId!: string;
}

export enum AdminRoleEnum {
  ADMIN = "admin",
}

@modelOptions({ schemaOptions: { id: true } })
@pre<Admin>("save", async function (next) {
  // Hash password before save
  if (!this.isModified("password") && this.password) next();
  this.password = await argon.hash(this.password || "", { saltLength: 10 });
})
export class Admin {
  @prop({ type: String, required: true, unique: true })
  email!: string;
  @prop({ type: String, required: true })
  password!: string;
  @prop({ type: String, required: true })
  firstname!: string;
  @prop({ type: String, required: true })
  lastname!: string;

  @prop({ type: String, required: true })
  username!: string;

  @prop({ type: String, enum: AdminRoleEnum, default: AdminRoleEnum.ADMIN, required: true })
  role!: string;

  @prop({ type: () => Avatar })
  profileAvatar?: Avatar;
}
