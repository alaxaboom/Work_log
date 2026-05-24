import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDate, formatVolume } from '@/lib/utils';
import type { WorkLog } from '@/types';
import { WorkLogsTableActions } from '@/components/WorkLogsTableActions';

interface WorkLogsDataTableProps {
  logs: WorkLog[];
  onEdit: (log: WorkLog) => void;
  onDelete: (log: WorkLog) => void;
}

export function WorkLogsDataTable({ logs, onEdit, onDelete }: WorkLogsDataTableProps) {
  const columns = useMemo<ColumnDef<WorkLog>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Дата',
        cell: ({ row }) => formatDate(row.original.date),
      },
      {
        id: 'workType',
        header: 'Вид работ',
        cell: ({ row }) => row.original.workType.name,
      },
      {
        id: 'volume',
        header: 'Объём',
        cell: ({ row }) =>
          formatVolume(row.original.volume, row.original.workType.unit),
      },
      {
        accessorKey: 'executorName',
        header: 'Исполнитель',
      },
      {
        accessorKey: 'notes',
        header: 'Примечания',
        cell: ({ row }) => (
          <span className="block max-w-xs truncate text-muted-foreground">
            {row.original.notes || '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: () => <span className="float-right">Действия</span>,
        cell: ({ row }) => (
          <WorkLogsTableActions
            onEdit={() => onEdit(row.original)}
            onDelete={() => onDelete(row.original)}
          />
        ),
      },
    ],
    [onEdit, onDelete],
  );

  const table = useReactTable({
    data: logs,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
