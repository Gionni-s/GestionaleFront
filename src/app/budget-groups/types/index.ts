export interface BudgetGroup {
  _id: string;
  name: string;
  max: number;
  resetPeriod: { number: number; interval: 'day' | 'week' | 'month' | 'year' };
  type: BudgetType;
  userId: string;
}

export type BudgetTypeSelect = 'expense' | 'saving';

export type BudgetType = { _id: BudgetTypeSelect; name: BudgetTypeSelect };

export interface BudgetGroupFormData {
  name: string;
  max: number;
  number: number;
  interval: 'day' | 'week' | 'month' | 'year';
  type: BudgetType;
  userId: string;
}
