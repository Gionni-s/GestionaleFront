import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState, useCallback } from 'react';
import Combobox from './Combobox';

// Tipizzazione per Body
interface Body {
  _id: string;
  name: string;
}

// Tipizzazione per Props
interface Props {
  label: string;
  body: Body[];
  form: Record<string, any>;
  setForm: Function;
  fieldToMap: string;
  base?: string | Record<string, any>;
  useCombobox?: boolean;
}

/**
 * Componente `MySelect` che gestisce un campo di selezione dinamico,
 * con supporto per il rendering di un elenco di opzioni, l'uso di un combobox
 * opzionale e la gestione del valore selezionato tramite un form.
 *
 * Può essere utilizzato per gestire opzioni di selezione, come ad esempio
 * la scelta di un elemento da una lista, con la possibilità di usare un
 * `Combobox` per una selezione più complessa. Supporta anche la personalizzazione
 * del comportamento in base a uno stato di base (base) passato come prop.
 *
 * @param {Object} props - Le proprietà del componente.
 * @param {string} props.label - L'etichetta da visualizzare nel select.
 * @param {Array<Object>} props.body - L'elenco degli oggetti che rappresentano
 *    le opzioni di selezione, ciascuno con un `_id` e un `name`.
 * @param {Object} props.form - Lo stato del modulo che contiene i dati da
 *    inviare.
 * @param {Function} props.setForm - Funzione per aggiornare lo stato del modulo.
 * @param {string} props.fieldToMap - Il campo da mappare all'interno dello stato
 *    del modulo.
 * @param {Object|string} [props.base] - Un valore di base da impostare come valore
 *    iniziale, se esiste.
 * @param {boolean} [props.useCombobox=false] - Se `true`, viene visualizzato un
 *    `Combobox` al posto del selettore.
 *
 * @returns {JSX.Element} Il componente di selezione con il valore selezionato.
 *
 * @example
 * <MySelect
 *   label="Seleziona un prodotto"
 *   body={[
 *     { _id: '1', name: 'Prodotto A' },
 *     { _id: '2', name: 'Prodotto B' }
 *   ]}
 *   form={form}
 *   setForm={setForm}
 *   fieldToMap="selectedProduct"
 *   base={{ _id: '1' }}
 * />
 */
export default function MySelect({
  label,
  body = [],
  form,
  setForm,
  fieldToMap,
  base,
  useCombobox = false,
}: Props) {
  const [selectedValue, setSelectedValue] = useState<string>('');

  useEffect(() => {
    if (body.length === 1) {
      setSelectedValue(body[0]._id);
      setForm((prevForm: any) => ({ ...prevForm, [fieldToMap]: body[0]._id }));
    } else if (
      base &&
      typeof base === 'object' &&
      body.some((item) => item._id === base._id)
    ) {
      setSelectedValue(base._id);
      setForm((prevForm: any) => ({ ...prevForm, [fieldToMap]: base._id }));
    } else if (
      base &&
      typeof base === 'string' &&
      body.some((item) => item._id === base)
    ) {
      setSelectedValue(base);
      setForm((prevForm: any) => ({ ...prevForm, [fieldToMap]: base }));
    } else {
      setSelectedValue('');
      setForm((prevForm: any) => ({ ...prevForm, [fieldToMap]: '' }));
    }
  }, [body, base, setForm, fieldToMap]);

  // Funzione per gestire il cambio di valore
  const handleChange = useCallback(
    (value: string) => {
      setSelectedValue(value);
      setForm((prevForm: any) => ({ ...prevForm, [fieldToMap]: value }));
    },
    [setForm, fieldToMap]
  );

  // Se useCombobox è attivo, mostra il componente Combobox
  if (useCombobox) {
    return (
      <Combobox
        label={label}
        body={body}
        form={form}
        setForm={setForm}
        fieldToMap={fieldToMap}
      />
    );
  }

  return body.length > 0 ? (
    <Select value={selectedValue} onValueChange={handleChange} required>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {body.map(({ _id, name }) => (
          <SelectItem
            key={_id}
            value={_id}
            className="cursor-pointer hover:bg-gray-100"
          >
            {name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : (
    <div className="w-full">
      <Select disabled>
        <SelectTrigger className="w-full cursor-not-allowed bg-gray-200">
          <SelectValue placeholder="Nessuna opzione disponibile" />
        </SelectTrigger>
      </Select>
    </div>
  );
}
