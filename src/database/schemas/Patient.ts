import {DocumentType, modelOptions, pre, prop, Severity} from "@typegoose/typegoose";
import argon from "argon2";
import { validateVerificationCode } from "@/utils/validate-verification-code";
import phoneRegex from "@/constants/phone-regex";
import {Session} from "@/database/schemas/Session";
import {db} from "@/database";

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

@pre<Patient>("save", async function (next) {
  // Hash password before save
  if (!this.isModified("password") && this.password) next();
  this.password = await argon.hash(this.password || "", { saltLength: 10 });
})

export class Patient {
  @prop({ type: String, required: true, unique:true, validate: {
      validator:function(v: string ){
         return phoneRegex.test(v);
      },
      message: 'Invalid Phone Format!'
    }
  })
  phone!: string;

  @prop({ type: String, required:true, minlength: 3, maxlength:250})
  firstName!: string;

  @prop({ type: String,required:true, minlength: 3, maxlength:250})
  lastName!: string;

  @prop({ type: String, required:true, minlength: 3, maxlength:250})
  password!: string;

  @prop({ type: String, validate:{
      validator: (v: string ) => !validateVerificationCode(v),
      message: 'Incorrect verification code!'
    }})
  verificationCode?: string;

  @prop({ type: String })
  resetPasswordToken?: string | null;

  @prop({ type: Date, required: false })
  resetPasswordTokenExpiration?: Date | null;

  public async getAppointments(this:DocumentType<Patient>): Promise<Session[]> {
    const appointments = await db.sessions.find({ patientId: this.id});
    return appointments;
  }

  public async getAvailableAppointments(this:DocumentType<Patient>, startDate: Date, endDate: Date): Promise<Session[]> {
    const appointments = await db.sessions.find({
      patientId: this.id,
      date: { $gte: startDate, $lte: endDate },
      status: 'pending',
    });
    return appointments;
  }
}
