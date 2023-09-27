import { pre, prop, modelOptions, Severity } from "@typegoose/typegoose";
import argon from "argon2";

export enum AccountRoleEnum {
  DEFAULT = "default",
  ADMIN = "admin",
}

const DEFAULT_PASSWORD = "12345678";

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
@pre<Account>("save", async function (next) {
  // Hash password before save
  if (!this.isModified("password") && this.password) next();
  this.password = await argon.hash(this.password || DEFAULT_PASSWORD, { saltLength: 10 });
})
export class Account {
  @prop({ type: String, required: true, unique: true })
  email!: string;

  @prop({ type: String, required: false, unique: true })
  handle?: string;

  @prop({ type: String, required: false })
  password?: string;

  @prop({ type: String, required: false })
  phone?: string;

  @prop({ enum: AccountRoleEnum, default: AccountRoleEnum.DEFAULT })
  role?: AccountRoleEnum;

  @prop({ type: Boolean, default: false })
  isActive?: boolean;

  @prop({ type: String })
  verificationCode?: string;

  @prop({ type: String })
  resetPasswordToken?: string | null;

  @prop({ type: Date, required: false })
  resetPasswordTokenExpiration?: Date | null;
}
