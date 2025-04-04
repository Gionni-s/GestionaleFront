'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserDashboard from './userDashboard';
import BudgetDashboard from './budgetDashboard';
import { useSelector } from 'react-redux';
import { selectUserRole } from '@/services/store/auth';

type TabItem = {
  id: string;
  label: string;
  roles: string[];
  component: React.ReactNode;
};

const DASHBOARD_TABS: TabItem[] = [
  {
    id: 'budget',
    label: 'Budget',
    roles: ['user', 'admin'],
    component: <BudgetDashboard />,
  },
  {
    id: 'users',
    label: 'Utenti',
    roles: ['admin'],
    component: <UserDashboard />,
  },
];

const Dashboard: React.FC = () => {
  const role = useSelector(selectUserRole) || '';

  // Filter tabs based on user role
  const availableTabs = DASHBOARD_TABS.filter((tab) =>
    tab.roles.includes(role)
  );

  // Set default tab value to the first available tab
  const defaultTab = availableTabs.length > 0 ? availableTabs[0].id : 'budget';

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <TabsList className={`grid w-full grid-cols-${availableTabs.length}`}>
        {availableTabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {availableTabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          {tab.component}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default Dashboard;
