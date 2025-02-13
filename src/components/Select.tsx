import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type body = {
  _id: string;
  name: string;
};

type Props = {
  label: string;
  body: body[];
  form: Object;
  setForm: Function;
  fieldToMap: string;
};

export default function MySelect({
  label,
  body,
  form,
  setForm,
  fieldToMap,
}: Props) {
  console.log({
    label,
    body,
    form,
    setForm,
    fieldToMap,
  });
  const handleChange = (value: string) => {
    setForm({ ...form, [fieldToMap]: value });
  };

  return (
    <Select
      value={(form?.[fieldToMap] as string) || ''}
      onValueChange={handleChange}
      required
    >
      <SelectTrigger>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {body.length > 0 ? (
          body.map((elem) => (
            <SelectItem key={elem._id} value={elem._id}>
              {elem.name}
            </SelectItem>
          ))
        ) : (
          <SelectItem disabled value="undefined">
            Nessuna opzione disponibile
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
