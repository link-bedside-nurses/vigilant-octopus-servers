import { Severity, modelOptions, pre, prop } from "@typegoose/typegoose";
import argon from "argon2";

export enum VerificationStatusEnum {
  Processing = "processing",
  Failed = "failed",
  Rejected = "rejected",
  Verified = "verified",
}

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
@pre<Caregiver>("save", async function (next) {
  // Hash password before save
  if (!this.isModified("password") && this.password) next();
  this.password = await argon.hash(this.password || "", { saltLength: 10 });
})
export class Caregiver {
  @prop({ type: String, required: true, unique: true })
  email!: string;

  @prop({ type: String })
  password?: string;

  @prop({ type: String })
  phoneContact?: string;

  @prop({ type: String })
  firstname?: string;

  @prop({ type: String })
  lastname?: string;

  @prop({ type: Date })
  dateOfBirth?: Date;

  @prop({ type: () => Avatar })
  profileAvatar?: Avatar;

  @prop({ type: Boolean, default: false })
  isEmailVerified?: boolean;

  @prop({ type: String })
  verificationCode?: string;

  @prop({ type: String })
  resetPasswordToken?: string;

  @prop({ type: Date, required: false })
  resetPasswordTokenExpiration?: Date;

  @prop({ type: String })
  nationalIdNumber?: string;

  @prop({ type: String })
  medicalLicenseNumber?: string;
}

// date of birth and age
// license
// verification status
// rejection reason
// registeration contract details
// working experience details
// qualifications documents
// statistics on platform
