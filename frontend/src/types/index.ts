export interface WorkType {
  id: string;
  name: string;
  unit: string;
  logsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkLog {
  id: string;
  date: string;
  workTypeId: string;
  volume: number;
  executorName: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  workType: Pick<WorkType, 'id' | 'name' | 'unit'>;
}

export interface WorkLogsQuery {
  dateFrom?: string;
  dateTo?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiErrorBody {
  message?: string | string[];
  statusCode?: number;
}
