export interface User {
  _id: string;
  email: string;
  name: string;
  surname: string;
}

export interface BudgetGroup {
  _id: string;
  name: string;
  max: number;
  userId: string;
}

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

export interface FormData {
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
