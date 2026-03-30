import { Module } from '@nestjs/common';
import { CourseController } from './course.controller';
import { CourseService } from './course.service';
import { MulterModule } from '@nestjs/platform-express';
import { MongooseModule } from '@nestjs/mongoose';
import { Course, CourseSchema } from './courseSchema';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MulterModule.register(),
    MongooseModule.forFeature([{ name: Course.name, schema: CourseSchema }]),
    AuthModule,
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
