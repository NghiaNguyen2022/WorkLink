import {
  Controller,
  Get,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  ExportQueryDto,
  ReportingQueryDto,
} from './dto/reporting.dto';
import { ReportingService } from './reporting.service';

@ApiTags('Reporting & Risk')
@Controller('reporting')
export class ReportingController {
  constructor(
    private readonly service: ReportingService,
  ) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'Dashboard KPI vận hành',
  })
  dashboard(@Query() query: ReportingQueryDto) {
    return this.service.dashboard(query);
  }

  @Get('reports/:report')
  @ApiOperation({
    summary: 'Báo cáo theo nhóm',
  })
  report(
    @Param('report') report: string,
    @Query() query: ReportingQueryDto,
  ) {
    return this.service.report(report, query);
  }

  @Get('export.csv')
  @ApiOperation({
    summary: 'Export báo cáo CSV',
  })
  async exportCsv(
    @Query() query: ExportQueryDto,
    @Res()
    response: {
      setHeader(name: string, value: string): void;
      send(body: string): void;
    },
  ) {
    const content =
      await this.service.exportCsv(query);

    const report = query.report ?? 'JOBS';

    response.setHeader(
      'Content-Type',
      'text/csv; charset=utf-8',
    );
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="worklink-${report.toLowerCase()}.csv"`,
    );

    response.send(`\uFEFF${content}`);
  }
}
