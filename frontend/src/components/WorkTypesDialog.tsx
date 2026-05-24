import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState, type MouseEvent } from 'react';
import { useForm } from 'react-hook-form';
import {
  createWorkType,
  deleteWorkType,
  fetchWorkTypes,
  updateWorkType,
} from '@/api/workTypes';
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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { CONSTRUCTION_UNITS } from '@/constants/units';
import {
  queryKeys,
  refreshWorkLogs,
  removeWorkTypeFromCache,
  syncWorkTypeInLogsCache,
  upsertWorkTypeInCache,
} from '@/lib/queryCache';
import { workTypeSchema, type WorkTypeFormValues } from '@/schemas';
import type { WorkType } from '@/types';

interface WorkTypesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyFormValues: WorkTypeFormValues = {
  name: '',
  unit: 'м²',
};

function formatLogsCount(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 === 1 && mod100 !== 11) {
    return `${count} запись`;
  }
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} записи`;
  }
  return `${count} записей`;
}

export function WorkTypesDialog({ open, onOpenChange }: WorkTypesDialogProps) {
  const queryClient = useQueryClient();
  const [editingType, setEditingType] = useState<WorkType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WorkType | null>(null);
  const [cascadeTarget, setCascadeTarget] = useState<WorkType | null>(null);

  const workTypesQuery = useQuery({
    queryKey: queryKeys.workTypes.all,
    queryFn: () => fetchWorkTypes(),
    enabled: open,
  });

  const form = useForm<WorkTypeFormValues>({
    resolver: zodResolver(workTypeSchema),
    defaultValues: emptyFormValues,
  });

  useEffect(() => {
    if (!open) {
      setEditingType(null);
      setDeleteTarget(null);
      setCascadeTarget(null);
      form.reset(emptyFormValues);
    }
  }, [open, form]);

  useEffect(() => {
    if (editingType) {
      const unit = CONSTRUCTION_UNITS.some((item) => item.value === editingType.unit)
        ? (editingType.unit as WorkTypeFormValues['unit'])
        : 'м²';
      form.reset({
        name: editingType.name,
        unit,
      });
      return;
    }
    form.reset(emptyFormValues);
  }, [editingType, form]);

  const saveMutation = useMutation({
    mutationFn: (values: WorkTypeFormValues) => {
      const payload = {
        name: values.name,
        unit: values.unit,
      };
      if (editingType) {
        return updateWorkType(editingType.id, payload);
      }
      return createWorkType(payload);
    },
    onSuccess: (saved) => {
      upsertWorkTypeInCache(queryClient, saved);
      syncWorkTypeInLogsCache(queryClient, saved);
      setEditingType(null);
      form.reset(emptyFormValues);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkType(id),
    onSuccess: async (_data, id) => {
      removeWorkTypeFromCache(queryClient, id);
      await refreshWorkLogs(queryClient);
      setDeleteTarget(null);
      setCascadeTarget(null);
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    saveMutation.mutate(values);
  });

  const handleDeleteConfirm = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (!deleteTarget) {
      return;
    }
    if (deleteTarget.logsCount > 0) {
      setCascadeTarget(deleteTarget);
      setDeleteTarget(null);
      return;
    }
    deleteMutation.mutate(deleteTarget.id);
  };

  const saveError =
    saveMutation.error instanceof Error ? saveMutation.error.message : null;
  const deleteError =
    deleteMutation.error instanceof Error ? deleteMutation.error.message : null;
  const unitValue = form.watch('unit');

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Справочник видов работ</DialogTitle>
            <DialogDescription>
              Список видов работ для выбора при создании записей журнала.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="overflow-hidden rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Наименование</TableHead>
                    <TableHead>Ед. изм.</TableHead>
                    <TableHead className="w-24 text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(workTypesQuery.data ?? []).map((workType) => (
                    <TableRow key={workType.id}>
                      <TableCell className="font-medium">{workType.name}</TableCell>
                      <TableCell>{workType.unit}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingType(workType)}
                            aria-label="Редактировать"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(workType)}
                            aria-label="Удалить"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <form onSubmit={onSubmit} className="space-y-4 rounded-xl border bg-muted/30 p-4">
              <div>
                <h3 className="font-medium">
                  {editingType ? 'Редактирование' : 'Добавление'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {editingType
                    ? 'Измените данные вида работ.'
                    : 'Добавьте новый пункт в справочник.'}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="work-type-name">Наименование</Label>
                <Input id="work-type-name" {...form.register('name')} />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Единица измерения</Label>
                <Select
                  value={unitValue}
                  onValueChange={(value) =>
                    form.setValue('unit', value as WorkTypeFormValues['unit'], {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите единицу" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONSTRUCTION_UNITS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.unit && (
                  <p className="text-sm text-destructive">{form.formState.errors.unit.message}</p>
                )}
              </div>

              {saveError && <p className="text-sm text-destructive">{saveError}</p>}

              <div className="flex gap-2">
                {editingType && (
                  <Button type="button" variant="outline" onClick={() => setEditingType(null)}>
                    Отменить
                  </Button>
                )}
                <Button type="submit" disabled={saveMutation.isPending} className="flex-1">
                  {saveMutation.isPending
                    ? 'Сохранение...'
                    : editingType
                      ? 'Сохранить'
                      : 'Добавить'}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить вид работ?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? `«${deleteTarget.name}» будет удалён из справочника.` : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={handleDeleteConfirm}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={cascadeTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setCascadeTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить связанные записи?</AlertDialogTitle>
            <AlertDialogDescription>
              {cascadeTarget
                ? `В журнале есть ${formatLogsCount(cascadeTarget.logsCount)} с видом работ «${cascadeTarget.name}». При удалении вида работ все эти записи тоже будут удалены без возможности восстановления. Продолжить?`
                : ''}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                const id = cascadeTarget?.id;
                if (id) {
                  deleteMutation.mutate(id);
                }
              }}
            >
              Удалить всё
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
