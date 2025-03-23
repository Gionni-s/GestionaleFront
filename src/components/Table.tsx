import { Pencil, Trash } from 'lucide-react';
import { Button } from './ui/button';
import {
  Table as UITable,
  TableHeader,
  TableRow,
  TableCell,
  TableHead,
} from './ui/table';

interface HeadProps {
  head: string[];
}

interface ColumnConfig {
  format?: (value: any, row: Record<string, any>) => string;
  className?: (value: any, row: Record<string, any>) => string;
}

interface BodyProps {
  body: Record<string, any>[];
  bodyKeys: string[];
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  columnConfig?: Record<string, ColumnConfig>;
}

type TableProps = HeadProps & BodyProps;

export default function Table({
  head,
  body,
  bodyKeys,
  onEdit,
  onDelete,
  columnConfig = {},
}: TableProps) {
  return (
    <UITable>
      <TableHeader>
        <TableRow>
          {head.map((val, index) => (
            <TableHead key={index}>{val}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <tbody>
        <GenerateBody
          body={body}
          bodyKeys={bodyKeys}
          onEdit={onEdit}
          onDelete={onDelete}
          columnConfig={columnConfig}
        />
      </tbody>
    </UITable>
  );
}

function GenerateBody({
  body,
  bodyKeys,
  onEdit,
  onDelete,
  columnConfig,
}: BodyProps) {
  if (!Array.isArray(body) || body.length === 0) {
    return (
      <TableRow>
        <TableCell colSpan={bodyKeys.length + 1} className="text-center">
          {body.length === 0 ? 'No Element Found' : 'Loading...'}
        </TableCell>
      </TableRow>
    );
  }

  return body.map((entity) => (
    <TableRow key={entity._id}>
      {bodyKeys.map((key) => {
        const rawValue = getNestedValue(entity, key);
        const formattedValue = columnConfig?.[key]?.format
          ? columnConfig[key].format(rawValue, entity)
          : rawValue;
        const dynamicClass = columnConfig?.[key]?.className
          ? columnConfig[key].className(rawValue, entity)
          : '';

        return (
          <TableCell key={key} className={dynamicClass}>
            {formattedValue}
          </TableCell>
        );
      })}
      <TableCell>
        <div className="flex space-x-2">
          <Button size="icon" variant="outline" onClick={() => onEdit(entity)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => onDelete(entity._id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  ));
}

function getNestedValue(obj: any, path: string): any {
  return path
    .split('.')
    .reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : 'N/A'),
      obj
    );
}
