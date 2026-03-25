import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types, Document } from 'mongoose';
import { Status } from 'src/common/roleEnum';

export type SubmissionDocument = Submission & Document;

@Schema({ timestamps: true })
export class Submission {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assignment',
    required: true,
  })
  assignment: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  student: Types.ObjectId;

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ default: null })
  grade: number;

  @Prop({ default: null })
  feedback: string;

  @Prop({
    type: String,
    enum: Status,
    default: Status.SUBMITTED,
  })
  status: string;
}

export const SubmissionSchema = SchemaFactory.createForClass(Submission);
