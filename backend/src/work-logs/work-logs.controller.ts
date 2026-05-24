import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CreateWorkLogDto } from './dto/create-work-log.dto';
import {
  QueryWorkLogsDto,
  UpdateWorkLogDto,
} from './dto/update-work-log.dto';
import { WorkLogsService } from './work-logs.service';

@Controller('work-logs')
export class WorkLogsController {
  constructor(private readonly workLogsService: WorkLogsService) {}

  @Get()
  findAll(@Query() query: QueryWorkLogsDto) {
    return this.workLogsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.workLogsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateWorkLogDto) {
    return this.workLogsService.create(dto);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkLogDto,
  ) {
    return this.workLogsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.workLogsService.remove(id);
  }
}
