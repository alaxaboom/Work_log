import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { deleteWorkLog } from '@/api/workLogs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { WorkLogsDataTable } from '@/components/WorkLogsDataTable';
import { formatDate } from '@/lib/utils';
import type { WorkLog } from '@/types';

interface WorkLogsTableProps {
  logs: WorkLog[];
  isLoading: boolean;
  onEdit: (log: WorkLog) => void;
}

export function WorkLogsTable({ logs, isLoading, onEdit }: WorkLogsTableProps) {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<WorkLog | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkLog(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['work-logs'] });
      setDeleteTarget(null);
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center text-muted-foreground">
        Загрузка записей...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center">
        <p className="text-lg font-medium">Записей пока нет</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Добавьте первую запись о выполненных работах.
        </p>
      </div>
    );
  }

  return (
    <>
      <WorkLogsDataTable
        logs={logs}
        onEdit={onEdit}
        onDelete={(log) => setDeleteTarget(log)}
      />

      <AlertDialog open={deleteTarget !== null} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
            <AlertDialogDescription>
              Запись за {deleteTarget ? formatDate(deleteTarget.date) : ''} будет удалена без
              возможности восстановления.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteTarget) {
                  deleteMutation.mutate(deleteTarget.id);
                }
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
