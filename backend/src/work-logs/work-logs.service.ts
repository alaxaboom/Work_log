import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { toWorkLogResponse } from '../common/serializers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkLogDto } from './dto/create-work-log.dto';
import {
  QueryWorkLogsDto,
  UpdateWorkLogDto,
} from './dto/update-work-log.dto';

@Injectable()
export class WorkLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryWorkLogsDto) {
    const dateFilter: Prisma.DateTimeFilter = {};

    if (query.dateFrom) {
      dateFilter.gte = new Date(query.dateFrom);
    }
    if (query.dateTo) {
      dateFilter.lte = new Date(query.dateTo);
    }

    const items = await this.prisma.workLog.findMany({
      where:
        query.dateFrom || query.dateTo ? { date: dateFilter } : undefined,
      include: { workType: true },
      orderBy: { date: query.sortOrder ?? 'desc' },
    });

    return items.map(toWorkLogResponse);
  }

  async findOne(id: string) {
    const item = await this.prisma.workLog.findUnique({
      where: { id },
      include: { workType: true },
    });
    if (!item) {
      throw new NotFoundException('Запись журнала не найдена');
    }
    return toWorkLogResponse(item);
  }

  async create(dto: CreateWorkLogDto) {
    await this.ensureWorkTypeExists(dto.workTypeId);
    const item = await this.prisma.workLog.create({
      data: {
        date: new Date(dto.date),
        workTypeId: dto.workTypeId,
        volume: dto.volume,
        executorName: dto.executorName.trim(),
        notes: dto.notes?.trim() || null,
      },
      include: { workType: true },
    });
    return toWorkLogResponse(item);
  }

  async update(id: string, dto: UpdateWorkLogDto) {
    await this.findOne(id);
    if (dto.workTypeId) {
      await this.ensureWorkTypeExists(dto.workTypeId);
    }
    const item = await this.prisma.workLog.update({
      where: { id },
      data: {
        ...(dto.date !== undefined ? { date: new Date(dto.date) } : {}),
        ...(dto.workTypeId !== undefined ? { workTypeId: dto.workTypeId } : {}),
        ...(dto.volume !== undefined ? { volume: dto.volume } : {}),
        ...(dto.executorName !== undefined
          ? { executorName: dto.executorName.trim() }
          : {}),
        ...(dto.notes !== undefined
          ? { notes: dto.notes?.trim() || null }
          : {}),
      },
      include: { workType: true },
    });
    return toWorkLogResponse(item);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.workLog.delete({ where: { id } });
  }

  private async ensureWorkTypeExists(workTypeId: string) {
    const workType = await this.prisma.workType.findUnique({
      where: { id: workTypeId },
    });
    if (!workType) {
      throw new NotFoundException('Вид работ не найден');
    }
  }
}
