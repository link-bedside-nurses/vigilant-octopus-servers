import {modelOptions, pre, prop, Severity} from "@typegoose/typegoose";
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

@modelOptions({
  schemaOptions: {
    id: true,
    virtuals: true,
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true,
      transform(_doc, ret): void {
        delete ret.password
        delete ret.__v
      },
    },
  },
  options: { allowMixed: Severity.ALLOW },
})
@pre<Admin>("save", async function (next) {
  if (!this.isModified("password") && Admin.prototype.password) next();
  Admin.prototype.password = await argon.hash(Admin.prototype.password || "", { saltLength: 10 });
})

export class Admin {
  @prop({ type: String, required: true, unique: true })
  phone!: string;

  @prop({ type: String, required: true })
  password!: string;

  @prop({ type: String, required: true })
  firstname!: string;

  @prop({ type: String, required: true })
  lastname!: string;

  @prop({ type: String, required: false, unique: true })
  email?: string;

  @prop({ type: String, enum: AdminRoleEnum, default: AdminRoleEnum.ADMIN, required: false })
  role?: string;

  @prop({ type: () => Avatar })
  profileAvatar?: Avatar;
}
