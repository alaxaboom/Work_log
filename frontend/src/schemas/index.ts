import { z } from 'zod';
import { CONSTRUCTION_UNIT_VALUES } from '@/constants/units';

export const workLogSchema = z.object({
  date: z.string().min(1, 'Укажите дату'),
  workTypeId: z.string().uuid('Выберите вид работ'),
  volume: z.coerce
    .number({ invalid_type_error: 'Объём должен быть числом' })
    .positive('Объём должен быть больше нуля'),
  executorName: z.string().trim().min(1, 'Укажите ФИО исполнителя'),
  notes: z.string().trim().optional(),
});

export type WorkLogFormValues = z.infer<typeof workLogSchema>;

export const workTypeSchema = z.object({
  name: z.string().trim().min(1, 'Укажите наименование'),
  unit: z.enum(CONSTRUCTION_UNIT_VALUES, {
    errorMap: () => ({ message: 'Выберите единицу измерения' }),
  }),
});

export type WorkTypeFormValues = z.infer<typeof workTypeSchema>;
