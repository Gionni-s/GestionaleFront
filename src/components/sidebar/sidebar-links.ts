import routes from '@/router';
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
  Calendar,
} from 'lucide-react';

export const getSidebarLinks = (t: (key: string) => string) => [
  { href: routes.label, label: t('labels'), icon: Users },
  { href: routes.food, label: t('foods'), icon: Utensils },
  { href: routes.recipe, label: t('recipes'), icon: BookOpen },
  {
    href: routes.warehouseEntity,
    label: t('warehouses'),
    icon: Warehouse,
  },
  {
    href: routes.shoppingList,
    label: t('shoppingLists'),
    icon: ShoppingCart,
  },
  { href: routes.budget, label: t('budgets'), icon: PiggyBank },
  { href: routes.budgetGroup, label: t('budgetGroups'), icon: Layers },
  { href: routes.calendar, label: t('calendar'), icon: Calendar },
  { href: routes.dashboard, label: t('dashboards'), icon: BarChart2 },
];
