import { getModelForClass, index, prop, modelOptions, type Ref } from "@typegoose/typegoose";
import { UserSchema } from "./user.js";

@index({ user: 1, uniId: 1 }, { unique: true })
@modelOptions({
  schemaOptions: { timestamps: true },
})
export class SavedUniversitySchema {
  @prop({ ref: () => UserSchema, required: true })
  public user!: Ref<UserSchema>;

  @prop({ type: Number, required: true })
  public uniId!: number;

  @prop({ type: String, required: true, trim: true })
  public name!: string;

  @prop({ type: String, required: true, trim: true })
  public address!: string;

  @prop({ type: String, required: true, trim: true })
  public city!: string;

  @prop({ type: String, required: true, trim: true, uppercase: true })
  public state!: string;

  @prop({ type: String, trim: true })
  public website?: string;
}

export const SavedUniversity = getModelForClass(SavedUniversitySchema)