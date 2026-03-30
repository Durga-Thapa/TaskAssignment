import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: 'User', required: true })
  instructors: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User', required: true, default: [] })
  students: Types.ObjectId[];
}

export const CourseSchema = SchemaFactory.createForClass(Course);
