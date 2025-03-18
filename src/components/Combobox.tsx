import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import {
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandItem,
  Command,
} from './ui/command';
import { cn } from '@/lib/utils';

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

export default function MyCombobox({
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
  const selectedValue = isValidValue
    ? currentValue
    : base && typeof base === 'object'
    ? base._id
    : base || '';

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(selectedValue);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value ? body.find((item) => item._id === value)?.name : label}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Cerca..." />
          <CommandList>
            <CommandEmpty>Nessuna opzione trovata.</CommandEmpty>
            <CommandGroup>
              {body.map(({ _id, name }) => (
                <CommandItem
                  key={_id}
                  value={name}
                  onSelect={() => {
                    setValue(name);
                    handleChange(_id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === name ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
