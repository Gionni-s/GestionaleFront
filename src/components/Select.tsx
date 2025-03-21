import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import Combobox from './Combobox';

type Body = {
  _id: string;
  name: string;
};

type Props = {
  label: string;
  body: Body[];
  form: { [key: string]: any };
  setForm: Function;
  fieldToMap: string;
  base?: string | { [key: string]: any };
  useCombobox?: boolean;
};

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
      // Se c'è solo un elemento, selezionalo automaticamente
      const singleValue = body[0]._id;
      setSelectedValue(singleValue);
      setForm((prevForm: any) => ({
        ...prevForm,
        [fieldToMap]: singleValue,
      }));
    } else {
      // Se esiste base, usa il valore predefinito
      const defaultValue =
        base && typeof base === 'object' ? base._id : base || '';
      setSelectedValue(defaultValue);
      setForm((prevForm: any) => ({
        ...prevForm,
        [fieldToMap]: defaultValue,
      }));
    }
  }, [body, base, setForm, fieldToMap]);

  const handleChange = (value: string) => {
    setSelectedValue(value);
    setForm({
      ...form,
      [fieldToMap]: value,
    });
  };

  return useCombobox ? (
    <Combobox
      label={label}
      body={body}
      form={form}
      setForm={setForm}
      fieldToMap={fieldToMap}
    />
  ) : (
    <div className="w-full">
      <Select value={selectedValue} onValueChange={handleChange} required>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent>
          {body.length > 0 ? (
            body.map(({ _id, name }) => (
              <SelectItem
                key={_id}
                value={_id}
                className="cursor-pointer hover:bg-gray-100"
              >
                {name}
              </SelectItem>
            ))
          ) : (
            <SelectItem disabled value="undefined" className="text-gray-400">
              Nessuna opzione disponibile
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
