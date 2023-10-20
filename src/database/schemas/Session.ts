import { DocumentType, prop } from "@typegoose/typegoose";

export class Session {
  @prop({ required: true, ref: "User" })
  userId!: string;

  @prop({ required: true })
  date!: Date;

  @prop({
    enum: ["pending", "confirmed", "cancelled", "In progress"],
    default: "pending",
  })
  status!: string;

  @prop({ type: String, required: true })
  reasonForVisit!: string;

  @prop({ type: String, required: false, default: "" })
  cancellationReason?: string;

  @prop({ type: () => [String], required: false, default: [] })
  symptoms?: string[];

  @prop({ type: String, required: false })
  notes?: string;

  public async confirmSession(this: DocumentType<Session>): Promise<void> {
    this.status = "confirmed";
    await this.save();
  }

  public async cancelSession(
    this: DocumentType<Session>,
    reason?: string,
  ): Promise<void> {
    this.status = "cancelled";
    this.cancellationReason = reason;
    await this.save();
  }
}

