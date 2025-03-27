import { Pencil, Trash } from 'lucide-react';
import { Button } from './ui/button';
import {
  Table as UITable,
  TableHeader,
  TableRow,
  TableCell,
  TableHead,
} from './ui/table';
import React from 'react';

type HeadColumnConfig = string | { label: string; className?: string };

interface HeadProps {
  head: HeadColumnConfig[];
}

interface ColumnConfig {
  format?: (value: any, row: Record<string, any>) => React.ReactNode;
  className?: (value: any, row: Record<string, any>) => string;
}

interface BodyProps {
  body: Record<string, any>[];
  bodyKeys: string[];
  onEdit?: (item: any) => void;
  onDelete?: (id: string) => void;
  disableActions?: boolean;
  columnConfig?: Record<string, ColumnConfig>;
}

type TableProps = HeadProps & BodyProps;

export default function Table({
  head,
  body,
  bodyKeys,
  onEdit,
  onDelete,
  disableActions = false,
  columnConfig = {},
}: TableProps) {
  return (
    <UITable>
      <TableHeader>
        <TableRow>
          {head.map((item, index) => {
            // Se `item` è una stringa, lo usiamo direttamente
            const label = typeof item === 'string' ? item : item.label;
            const className =
              typeof item === 'object' && item.className ? item.className : '';

            return (
              <TableHead key={index} className={className}>
                {label}
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <tbody>
        <GenerateBody
          body={body}
          bodyKeys={bodyKeys}
          onEdit={onEdit}
          onDelete={onDelete}
          disableActions={disableActions}
          columnConfig={columnConfig}
        />
      </tbody>
    </UITable>
  );
}

function GenerateBody({
  body,
  bodyKeys,
  onEdit = () => {},
  onDelete = () => {},
  disableActions,
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
        if (key.includes('|')) {
          // Gestione campi multipli concatenati
          const keys = key.split('|');

          // Ottenere i valori formattati e applicare classi dinamiche
          const values = keys.map((subKey) => {
            const rawValue = getNestedValue(entity, subKey);
            return columnConfig?.[subKey]?.format
              ? columnConfig[subKey].format(rawValue, entity)
              : rawValue;
          });

          const concatenatedValue = values.join(' ');
          const dynamicClass =
            keys
              .map((subKey) =>
                columnConfig?.[subKey]?.className?.(
                  getNestedValue(entity, subKey),
                  entity
                )
              )
              .find((cls) => cls) || '';

          return (
            <TableCell key={key} className={dynamicClass}>
              {concatenatedValue}
            </TableCell>
          );
        }

        const rawValue = getNestedValue(entity, key);
        const formattedValue = columnConfig?.[key]?.format
          ? columnConfig[key].format(rawValue, entity)
          : rawValue;
        const dynamicClass = columnConfig?.[key]?.className
          ? columnConfig[key].className(rawValue, entity)
          : '';

        return (
          <TableCell key={key} className={dynamicClass}>
            {/* Permette il rendering di JSX se il formato restituisce un componente */}
            {React.isValidElement(formattedValue)
              ? formattedValue
              : formattedValue}
          </TableCell>
        );
      })}

      {!disableActions && (
        <TableCell>
          <div className="flex space-x-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => onEdit(entity)}
            >
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
      )}
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
