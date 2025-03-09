import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Warehouse } from 'lucide-react';
import { useEffect } from 'react';

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
};
export default function MySelect({
  label,
  body = [],
  form,
  setForm,
  fieldToMap,
  base,
}: Props) {
  const currentValue = form[fieldToMap];

  useEffect(() => {
    if (body.length === 1 && base) {
      setForm((prevForm: any) => ({
        ...prevForm,
        [fieldToMap]: body[0]._id,
      }));
    }
  }, [body, base, setForm, fieldToMap]);

  const handleChange = (value: string) => {
    setForm({
      ...form,
      [fieldToMap]: value,
    });
  };

  const isValidValue = body.some((item) => item._id === currentValue);
  console.log(isValidValue);
  const selectedValue = isValidValue
    ? currentValue
    : base && typeof base === 'object'
    ? base._id
    : base || '';
  console.log({ selectedValue });

  return (
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
