import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type AssignmentDocument = Assignment & Document;

@Schema({ timestamps: true })
export class Assignment {
  @Prop({ type: String, required: true, trim: true })
  title: string;

  @Prop({ type: String, trim: true, required: true })
  description: string;

  @Prop({ required: true })
  deadline: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacher: Types.ObjectId;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
