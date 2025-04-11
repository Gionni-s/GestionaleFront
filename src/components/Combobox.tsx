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
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    if (body.length === 1) {
      const singleValue = body[0]._id;
      setValue(singleValue);
      setForm((prevForm: any) => ({
        ...prevForm,
        [fieldToMap]: singleValue,
      }));
    } else {
      const defaultValue =
        base && typeof base === 'object' ? base._id : base || '';
      setValue(defaultValue);
      setForm((prevForm: any) => ({
        ...prevForm,
        [fieldToMap]: defaultValue,
      }));
    }
  }, [body, base, setForm, fieldToMap]);

  const handleChange = (newValue: string) => {
    setValue(newValue);
    setForm({
      ...form,
      [fieldToMap]: newValue,
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {body.length > 0
            ? body.find((item) => item._id === value)?.name || label
            : label}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Cerca..." />
          <CommandList>
            <CommandEmpty>Nessuna opzione trovata.</CommandEmpty>
            <CommandGroup>
              {body.length > 0 &&
                body.map(({ _id, name }) => (
                  <CommandItem
                    key={_id}
                    value={name}
                    onSelect={() => {
                      handleChange(_id);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === _id ? 'opacity-100' : 'opacity-0'
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
