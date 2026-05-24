import { useQuery } from '@tanstack/react-query';
import { ArrowDownUp, Plus, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { fetchWorkLogs } from '@/api/workLogs';
import { fetchWorkTypes } from '@/api/workTypes';
import { queryKeys } from '@/lib/queryCache';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WorkLogDialog } from '@/components/WorkLogDialog';
import { WorkLogsTable } from '@/components/WorkLogsTable';
import { WorkTypesDialog } from '@/components/WorkTypesDialog';
import type { WorkLog, WorkLogsQuery } from '@/types';

export function HomePage() {
  const [filters, setFilters] = useState<WorkLogsQuery>({
    sortOrder: 'desc',
  });
  const [draftFilters, setDraftFilters] = useState({
    dateFrom: '',
    dateTo: '',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
  const [workLogDialogOpen, setWorkLogDialogOpen] = useState(false);
  const [workTypesDialogOpen, setWorkTypesDialogOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkLog | null>(null);

  const workLogsQuery = useQuery({
    queryKey: queryKeys.workLogs.list(filters),
    queryFn: () => fetchWorkLogs(filters),
  });

  useQuery({
    queryKey: queryKeys.workTypes.all,
    queryFn: () => fetchWorkTypes(),
  });

  const applyFilters = () => {
    setFilters({
      dateFrom: draftFilters.dateFrom || undefined,
      dateTo: draftFilters.dateTo || undefined,
      sortOrder: draftFilters.sortOrder,
    });
  };

  const resetFilters = () => {
    const reset = { dateFrom: '', dateTo: '', sortOrder: 'desc' as const };
    setDraftFilters(reset);
    setFilters({ sortOrder: 'desc' });
  };

  const openCreateDialog = () => {
    setEditingLog(null);
    setWorkLogDialogOpen(true);
  };

  const openEditDialog = (log: WorkLog) => {
    setEditingLog(log);
    setWorkLogDialogOpen(true);
  };

  return (
    <div className="mx-auto min-h-svh max-w-6xl px-4 py-8 sm:px-6">
      <header className="mb-12">
        <h1 className="w-full whitespace-nowrap text-center text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-4xl">
          Учёт выполненных работ на строительном объекте по дням
        </h1>
      </header>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-4">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ArrowDownUp className="h-4 w-4" />
              Фильтры
            </CardTitle>
            <CardDescription>Фильтрация и сортировка записей по дате выполнения.</CardDescription>
          </div>
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => setWorkTypesDialogOpen(true)}>
              <Settings2 className="h-4 w-4" />
              Виды работ
            </Button>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4" />
              Новая запись
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="date-from">Дата с</Label>
              <Input
                id="date-from"
                type="date"
                value={draftFilters.dateFrom}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    dateFrom: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date-to">Дата по</Label>
              <Input
                id="date-to"
                type="date"
                value={draftFilters.dateTo}
                onChange={(event) =>
                  setDraftFilters((current) => ({
                    ...current,
                    dateTo: event.target.value,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Сортировка по дате</Label>
              <Select
                value={draftFilters.sortOrder}
                onValueChange={(value: 'asc' | 'desc') =>
                  setDraftFilters((current) => ({ ...current, sortOrder: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Сначала новые</SelectItem>
                  <SelectItem value="asc">Сначала старые</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button className="flex-1" onClick={applyFilters}>
                Применить
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                Сбросить
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {workLogsQuery.isError && (
        <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {workLogsQuery.error instanceof Error
            ? workLogsQuery.error.message
            : 'Не удалось загрузить записи журнала'}
        </div>
      )}

      <WorkLogsTable
        logs={workLogsQuery.data ?? []}
        isLoading={workLogsQuery.isLoading}
        onEdit={openEditDialog}
      />

      <WorkLogDialog
        open={workLogDialogOpen}
        onOpenChange={(open) => {
          setWorkLogDialogOpen(open);
          if (!open) {
            setEditingLog(null);
          }
        }}
        entry={editingLog}
      />

      <WorkTypesDialog open={workTypesDialogOpen} onOpenChange={setWorkTypesDialogOpen} />
    </div>
  );
}
