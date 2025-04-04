export interface BudgetGroup {
  _id: string;
  name: string;
  max: number;
  resetPeriod: { number: number; interval: 'day' | 'week' | 'month' | 'year' };
  userId: string;
}

export interface FormData {
  name: string;
  max: number;
  number: number;
  interval: 'day' | 'week' | 'month' | 'year';
  userId: string;
}
