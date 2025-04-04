import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { BudgetGroup, FormData } from '../types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Select from '@/components/Select';

const BudgetForm: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  form: FormData;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  editingId: string | null;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  budgetGroups: BudgetGroup[];
  loading: boolean;
}> = ({
  isOpen,
  onOpenChange,
  form,
  setForm,
  editingId,
  onSubmit,
  budgetGroups,
  loading,
}) => {
  const handleChange = (field: keyof FormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingId ? 'Edit Budget' : 'Add Budget'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="importo">Amount</Label>
            <Input
              id="importo"
              type="number"
              value={form.amount}
              onChange={(e) => handleChange('amount', +e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={form.dateTime}
              onChange={(e) => handleChange('dateTime', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="groupId">Groups</Label>
            <Select
              label="Select a group"
              body={budgetGroups}
              form={form}
              setForm={setForm}
              fieldToMap="groupId"
              useCombobox={true}
            />
          </div>
          <div>
            <Label htmlFor="note">Note</Label>
            <Input
              id="note"
              type="text"
              value={form.note}
              onChange={(e) => handleChange('note', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="beneficiary">Beneficiary</Label>
            <Input
              id="beneficiary"
              type="text"
              value={form.beneficiary}
              onChange={(e) => handleChange('beneficiary', e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {editingId ? 'Update' : 'Create'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetForm;
