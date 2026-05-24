import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createWorkLog, updateWorkLog } from '@/api/workLogs';
import { fetchWorkTypes } from '@/api/workTypes';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { queryKeys, refreshWorkLogs, upsertWorkLogInCache } from '@/lib/queryCache';
import { workLogSchema, type WorkLogFormValues } from '@/schemas';
import type { WorkLog } from '@/types';

interface WorkLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: WorkLog | null;
}

const emptyValues: WorkLogFormValues = {
  date: new Date().toISOString().slice(0, 10),
  workTypeId: '',
  volume: 1,
  executorName: '',
  notes: '',
};

export function WorkLogDialog({ open, onOpenChange, entry }: WorkLogDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = entry !== null;

  const workTypesQuery = useQuery({
    queryKey: queryKeys.workTypes.all,
    queryFn: () => fetchWorkTypes(),
    enabled: open,
  });

  const form = useForm<WorkLogFormValues>({
    resolver: zodResolver(workLogSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    if (entry) {
      form.reset({
        date: entry.date,
        workTypeId: entry.workTypeId,
        volume: entry.volume,
        executorName: entry.executorName,
        notes: entry.notes ?? '',
      });
      return;
    }
    form.reset(emptyValues);
  }, [open, entry, form]);

  const mutation = useMutation({
    mutationFn: (values: WorkLogFormValues) => {
      const payload = {
        date: values.date,
        workTypeId: values.workTypeId,
        volume: values.volume,
        executorName: values.executorName,
        notes: values.notes?.trim() || undefined,
      };
      if (isEditing && entry) {
        return updateWorkLog(entry.id, payload);
      }
      return createWorkLog(payload);
    },
    onSuccess: async (saved) => {
      if (isEditing) {
        upsertWorkLogInCache(queryClient, saved);
        void refreshWorkLogs(queryClient);
      } else {
        await refreshWorkLogs(queryClient);
      }
      onOpenChange(false);
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values);
  });

  const workTypeId = form.watch('workTypeId');
  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Редактирование записи' : 'Новая запись'}</DialogTitle>
          <DialogDescription>
            Укажите дату, вид работ, объём и исполнителя.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Дата выполнения</Label>
            <Input id="date" type="date" {...form.register('date')} />
            {form.formState.errors.date && (
              <p className="text-sm text-destructive">{form.formState.errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Вид работ</Label>
            <Select
              value={workTypeId}
              onValueChange={(value) =>
                form.setValue('workTypeId', value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите вид работ" />
              </SelectTrigger>
              <SelectContent>
                {(workTypesQuery.data ?? []).map((workType) => (
                  <SelectItem key={workType.id} value={workType.id}>
                    {workType.name} ({workType.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.workTypeId && (
              <p className="text-sm text-destructive">
                {form.formState.errors.workTypeId.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="volume">Объём</Label>
            <Input
              id="volume"
              type="number"
              step="0.01"
              min="0.01"
              {...form.register('volume')}
            />
            {form.formState.errors.volume && (
              <p className="text-sm text-destructive">{form.formState.errors.volume.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="executorName">Исполнитель</Label>
            <Input id="executorName" {...form.register('executorName')} />
            {form.formState.errors.executorName && (
              <p className="text-sm text-destructive">
                {form.formState.errors.executorName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Примечания</Label>
            <Textarea id="notes" rows={3} {...form.register('notes')} />
          </div>

          {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? 'Сохранение...'
                : isEditing
                  ? 'Сохранить'
                  : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
