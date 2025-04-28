import {
  Home,
  Settings,
  Users,
  Utensils,
  BookOpen,
  Warehouse,
  PiggyBank,
  Layers,
  BarChart2,
  ShoppingCart,
} from 'lucide-react';

export const getSidebarLinks = (t: (key: string) => string) => [
  { href: '/label', label: t('labels'), icon: Users },
  { href: '/food', label: t('foods'), icon: Utensils },
  { href: '/recipe', label: t('recipes'), icon: BookOpen },
  {
    href: '/warehouse-entities',
    label: t('warehouses'),
    icon: Warehouse,
  },
  {
    href: '/shopping-list',
    label: t('shoppingLists'),
    icon: ShoppingCart,
  },
  { href: '/budget', label: t('budgets'), icon: PiggyBank },
  { href: '/budget-groups', label: t('budgetGroups'), icon: Layers },
  { href: '/dashboard', label: t('dashboards'), icon: BarChart2 },
];
