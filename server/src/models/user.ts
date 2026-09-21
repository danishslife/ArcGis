import {
  getModelForClass,
  prop,
  modelOptions,
  pre,
} from "@typegoose/typegoose";
import bcrypt from "bcrypt";


@pre<UserSchema>("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 10);
})
@modelOptions({ schemaOptions: { timestamps: true } })
export class UserSchema {
  @prop({ type: String, required: true, trim: true })
  public firstName!: string;
  @prop({ type: String, required: true, trim: true })
  public lastName!: string;
  @prop({ type: String, required: true, unique: true, lowercase: true, trim: true })
  public email!: string;
  @prop({ type: String, required: true, select: false })
  public password!: string;
}
export const User = getModelForClass(UserSchema);
