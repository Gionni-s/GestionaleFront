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
  /** Array di intestazioni della tabella. Ogni intestazione può essere una stringa o un oggetto con label e className opzionale. */
  head: HeadColumnConfig[];
}

interface ColumnConfig {
  /**
   * Funzione opzionale per formattare il valore di una cella.
   * @param value Il valore della cella.
   * @param row L'intera riga di dati.
   * @returns Il valore formattato come stringa o JSX.
   * @example
   * columnConfig: {
   *   price: { format: (value) => `$${value.toFixed(2)}` }
   * }
   */
  format?: (value: any, row: Record<string, any>) => React.ReactNode;

  /**
   * Funzione opzionale per definire classi CSS dinamiche in base al valore.
   * @param value Il valore della cella.
   * @param row L'intera riga di dati.
   * @returns Una stringa con il nome della classe CSS.
   * @example
   * columnConfig: {
   *   status: { className: (value) => value === 'active' ? 'text-green-500' : 'text-red-500' }
   * }
   */
  className?: (value: any, row: Record<string, any>) => string;
}

interface BodyProps {
  /** Array di oggetti contenenti i dati della tabella. */
  body: Record<string, any>[];

  /** Array di chiavi che identificano le colonne del corpo della tabella. */
  bodyKeys: string[];

  /** Funzione chiamata quando si clicca il pulsante di modifica. */
  onEdit?: (item: any) => void;

  /** Funzione chiamata quando si clicca il pulsante di eliminazione. */
  onDelete?: (id: string) => void;

  /** Se `true`, nasconde i pulsanti di azione (modifica/elimina). */
  disableActions?: boolean;

  /** Configurazione opzionale delle colonne per personalizzare la formattazione e le classi CSS. */
  columnConfig?: Record<string, ColumnConfig>;
}

type TableProps = HeadProps & BodyProps;

/**
 * Componente tabella riutilizzabile con supporto per intestazioni dinamiche,
 * formattazione personalizzata e azioni su righe.
 *
 * @param {TableProps} props - Proprietà del componente.
 * @returns {JSX.Element} Componente tabella.
 * @example
 * <Table
 *   head={['Nome', 'Prezzo', { label: 'Stato', className: 'text-center' }]}
 *   body={[
 *     { _id: '1', name: 'Prodotto A', price: 10.5, status: 'active' },
 *     { _id: '2', name: 'Prodotto B', price: 15, status: 'inactive' }
 *   ]}
 *   bodyKeys={['name', 'price', 'status']}
 *   columnConfig={{
 *     price: { format: (value) => `$${value.toFixed(2)}` },
 *     status: { className: (value) => value === 'active' ? 'text-green-500' : 'text-red-500' }
 *   }}
 *   onEdit={(item) => console.log('Modifica:', item)}
 *   onDelete={(id) => console.log('Elimina:', id)}
 * />
 */
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

/**
 * Genera il corpo della tabella con i dati forniti.
 * @param {BodyProps} props - Proprietà del corpo della tabella.
 */
function GenerateBody({
  body,
  bodyKeys,
  onEdit = () => {},
  onDelete = () => {},
  disableActions,
  columnConfig,
}: BodyProps) {
  if (!Array.isArray(body)) {
    console.log(body);
    return (
      <TableRow>
        <TableCell colSpan={bodyKeys.length + 1} className="text-center">
          No Element Found
        </TableCell>
      </TableRow>
    );
  }

  if (body.length === 0) {
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
          const keys = key.split('|');
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

/**
 * Estrae un valore annidato da un oggetto usando una stringa con notazione a punti.
 * @param {any} obj - L'oggetto di partenza.
 * @param {string} path - La stringa che rappresenta il percorso del valore.
 * @returns {any} Il valore estratto o 'N/A' se non trovato.
 */
function getNestedValue(obj: any, path: string): any {
  return path
    .split('.')
    .reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : 'N/A'),
      obj
    );
}
