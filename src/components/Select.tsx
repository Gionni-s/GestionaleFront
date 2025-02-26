import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
};

export default function MySelect({
  label,
  body = [],
  form,
  setForm,
  fieldToMap,
}: Props) {
  // Validate form value exists and is a string
  const currentValue = form[fieldToMap];

  const handleChange = (value: string) => {
    setForm({
      ...form,
      [fieldToMap]: value,
    });
  };

  // Check if the current value exists in the options
  const isValidValue = body.some((item) => item._id === currentValue);

  return (
    <div className="w-full">
      <Select
        value={isValidValue ? currentValue : ''}
        onValueChange={handleChange}
        required
      >
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
