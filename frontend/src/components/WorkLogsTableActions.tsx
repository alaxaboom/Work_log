import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WorkLogsTableActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export function WorkLogsTableActions({ onEdit, onDelete }: WorkLogsTableActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" onClick={onEdit} aria-label="Редактировать">
        <Pencil className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete} aria-label="Удалить">
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  );
}
