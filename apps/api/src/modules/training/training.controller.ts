import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  CreateAssessmentDto,
  CreateCourseDto,
  EnrollWorkerDto,
  RevokeCertificateDto,
  SubmitAssessmentDto,
  UpdateProgressDto,
} from './dto/training.dto';
import { TrainingService } from './training.service';

@ApiTags('Training & Certification')
@Controller()
export class TrainingController {
  constructor(
    private readonly service: TrainingService,
  ) {}

  @Get('training/courses')
  listCourses() {
    return this.service.listCourses();
  }

  @Post('training/courses')
  createCourse(@Body() dto: CreateCourseDto) {
    return this.service.createCourse(dto);
  }

  @Get('training/courses/:courseId')
  getCourse(@Param('courseId') courseId: string) {
    return this.service.getCourse(courseId);
  }

  @Post('training/courses/:courseId/enrollments')
  enroll(
    @Param('courseId') courseId: string,
    @Body() dto: EnrollWorkerDto,
  ) {
    return this.service.enroll(courseId, dto);
  }

  @Post('training/enrollments/:enrollmentId/progress')
  updateProgress(
    @Param('enrollmentId') enrollmentId: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.service.updateProgress(
      enrollmentId,
      dto,
    );
  }

  @Post('training/courses/:courseId/assessments')
  createAssessment(
    @Param('courseId') courseId: string,
    @Body() dto: CreateAssessmentDto,
  ) {
    return this.service.createAssessment(
      courseId,
      dto,
    );
  }

  @Get('training/assessments/:assessmentId')
  getAssessment(
    @Param('assessmentId') assessmentId: string,
  ) {
    return this.service.getAssessment(
      assessmentId,
      false,
    );
  }

  @Post('training/assessments/:assessmentId/submit')
  submitAssessment(
    @Param('assessmentId') assessmentId: string,
    @Body() dto: SubmitAssessmentDto,
  ) {
    return this.service.submitAssessment(
      assessmentId,
      dto,
    );
  }

  @Get('workers/:workerId/training')
  workerTraining(
    @Param('workerId') workerId: string,
  ) {
    return this.service.workerTraining(workerId);
  }

  @Post('worker-certificates/:certificateId/revoke')
  revokeCertificate(
    @Param('certificateId') certificateId: string,
    @Body() dto: RevokeCertificateDto,
  ) {
    return this.service.revokeCertificate(
      certificateId,
      dto,
    );
  }
}
