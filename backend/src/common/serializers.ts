import type { WorkLog, WorkType } from '@prisma/client';

export interface WorkTypeResponse {
  id: string;
  name: string;
  unit: string;
  logsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkLogResponse {
  id: string;
  date: string;
  workTypeId: string;
  volume: number;
  executorName: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  workType: Pick<WorkTypeResponse, 'id' | 'name' | 'unit'>;
}

type WorkLogWithType = WorkLog & { workType: WorkType };

type WorkTypeWithCount = WorkType & {
  _count: { workLogs: number };
};

export function toWorkTypeResponse(workType: WorkTypeWithCount): WorkTypeResponse {
  return {
    id: workType.id,
    name: workType.name,
    unit: workType.unit,
    logsCount: workType._count.workLogs,
    createdAt: workType.createdAt.toISOString(),
    updatedAt: workType.updatedAt.toISOString(),
  };
}

export function toWorkLogResponse(workLog: WorkLogWithType): WorkLogResponse {
  return {
    id: workLog.id,
    date: workLog.date.toISOString().slice(0, 10),
    workTypeId: workLog.workTypeId,
    volume: Number(workLog.volume.toString()),
    executorName: workLog.executorName,
    notes: workLog.notes,
    createdAt: workLog.createdAt.toISOString(),
    updatedAt: workLog.updatedAt.toISOString(),
    workType: {
      id: workLog.workType.id,
      name: workLog.workType.name,
      unit: workLog.workType.unit,
    },
  };
}
