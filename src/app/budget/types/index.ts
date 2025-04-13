import { BudgetGroup } from '@/app/budget-groups/types';
import { User } from '@/app/Profile/types';

export interface Budget {
  _id: string;
  name: string;
  amount: number;
  amountType: string;
  beneficiary: string;
  groupId: string;
  'Budget-Group': BudgetGroup;
  note: string;
  dateTime: string;
  userId: string;
  User: User;
}

export interface BudgetFormData {
  name: string;
  amount: number;
  amountType: string;
  beneficiary: string;
  groupId: string;
  note: string;
  dateTime: string;
  userId: string;
}

export interface Kpi {
  _id: string;
  name: string;
  max: number;
  total: number;
}

export interface BudgetGroupKpi {
  _id: string;
  name: string;
}

export interface DeleteModalProps {
  isOpen: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}
