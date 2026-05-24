import { Injectable, NotFoundException } from '@nestjs/common';
import { toWorkTypeResponse } from '../common/serializers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWorkTypeDto } from './dto/create-work-type.dto';
import { UpdateWorkTypeDto } from './dto/update-work-type.dto';

@Injectable()
export class WorkTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const items = await this.prisma.workType.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { workLogs: true } } },
    });
    return items.map(toWorkTypeResponse);
  }

  async findOne(id: string) {
    const item = await this.prisma.workType.findUnique({
      where: { id },
      include: { _count: { select: { workLogs: true } } },
    });
    if (!item) {
      throw new NotFoundException('Вид работ не найден');
    }
    return toWorkTypeResponse(item);
  }

  async create(dto: CreateWorkTypeDto) {
    const item = await this.prisma.workType.create({
      data: {
        name: dto.name.trim(),
        unit: dto.unit.trim(),
      },
      include: { _count: { select: { workLogs: true } } },
    });
    return toWorkTypeResponse(item);
  }

  async update(id: string, dto: UpdateWorkTypeDto) {
    await this.findOne(id);
    const item = await this.prisma.workType.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        ...(dto.unit !== undefined ? { unit: dto.unit.trim() } : {}),
      },
      include: { _count: { select: { workLogs: true } } },
    });
    return toWorkTypeResponse(item);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.workType.delete({ where: { id } });
  }
}
