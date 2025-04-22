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
} from 'lucide-react';

export const sidebarLinks = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/label', label: 'Labels', icon: Users },
  { href: '/food', label: 'Foods', icon: Utensils },
  { href: '/recipe', label: 'Recipes', icon: BookOpen },
  {
    href: '/warehouse-entities',
    label: 'Warehouse',
    icon: Warehouse,
  },
  { href: '/budget', label: 'Budgets', icon: PiggyBank },
  { href: '/budget-groups', label: 'Budget Groups', icon: Layers },
  { href: '/dashboard', label: 'Dashboards', icon: BarChart2 },
];
