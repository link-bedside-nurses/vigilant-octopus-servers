import { pre, prop, modelOptions, Severity } from "@typegoose/typegoose";
import argon from "argon2";

@modelOptions({ schemaOptions: { _id: false, versionKey: false } })
class Avatar {
  @prop({ type: String })
  url!: string;

  @prop({ type: String })
  publicId!: string;
}

@modelOptions({
  schemaOptions: {
    id: true,
    virtuals: true,
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
  options: { allowMixed: Severity.ALLOW },
})
@pre<Customer>("save", async function (next) {
  // Hash password before save
  if (!this.isModified("password") && this.password) next();
  this.password = await argon.hash(this.password || "", { saltLength: 10 });
})
export class Customer {
  @prop({ type: String, required: true, unique: true })
  email!: string;

  @prop({ type: String, required: false, unique: true })
  username?: string;

  @prop({ type: String, required: false })
  password?: string;

  @prop({ type: String, required: false })
  phone?: string;

  @prop({ type: () => Avatar })
  profileAvatar?: Avatar;

  @prop({ type: Boolean, default: false })
  isEmailVerified?: boolean;

  @prop({ type: String })
  verificationCode?: string;

  @prop({ type: String })
  resetPasswordToken?: string | null;

  @prop({ type: Date, required: false })
  resetPasswordTokenExpiration?: Date | null;
}
