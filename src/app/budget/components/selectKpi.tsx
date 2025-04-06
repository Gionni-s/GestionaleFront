import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { BudgetGroupKpi } from '../types';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTranslation } from 'react-i18next';

const SelectKpiDialog: React.FC<{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: () => Promise<void>;
  groups: BudgetGroupKpi[];
  selectedGroups: string[];
  onToggleGroup: (group: BudgetGroupKpi) => void;
  isLoading: boolean;
}> = ({
  isOpen,
  onOpenChange,
  onSubmit,
  groups,
  selectedGroups,
  onToggleGroup,
  isLoading,
}) => {
  const { t, i18n } = useTranslation();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button onClick={() => onOpenChange(true)}>{t('selectGroups')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('selectGroups')}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            {groups.length === 0 ? (
              <div className="text-gray-500">{t('noGroupAvailables')}</div>
            ) : (
              groups.map((group) => (
                <div key={group._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={group._id}
                    checked={selectedGroups.includes(group._id)}
                    onCheckedChange={() => onToggleGroup(group)}
                  />
                  <label htmlFor={group._id} className="text-sm font-medium">
                    {group.name}
                  </label>
                </div>
              ))
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('loadings') : t('selects')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SelectKpiDialog;
