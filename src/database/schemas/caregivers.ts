import { Severity, modelOptions, pre, prop } from "@typegoose/typegoose";
import argon from "argon2";

export enum VerificationStatusEnum {
  PROCESSING = "PROCESSING",
  FAILED = "FAILED",
  REJECTED = "REJECTED",
  VERIFIED = "VERIFIED",
  PENDING="PENDING"
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
  if (!this.isModified("password") && Caregiver.prototype.password) next();
  Caregiver.prototype.password = await argon.hash(Caregiver.prototype.password || "", { saltLength: 10 });
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

  @prop({type:Number})
  otp?:number

  @prop({ type: String })
  verificationCode?: string;

  @prop({ type: String })
  passwordResetToken?: string;

  @prop({ type: Date, required: false })
  passwordResetTokenExpiration?: Date;

  @prop({ type: String })
  nationalIdNumber?: string;

  @prop({ type: String })
  medicalLicenseNumber?: string;
}

// date of birth and age
// license
// verification status
// rejection reason
// registration contract details
// working experience details
// qualifications documents
// statistics on platform
// verifiedBy
