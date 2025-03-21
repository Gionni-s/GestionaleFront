'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserDashboard from './userDashbord';
import BudgetDashbord from './budgetDashbord';
import { useSelector } from 'react-redux';
import { selectUserRole } from '@/services/store/auth';

const generateDashboardTabs = (role: string) => {
  const tabs = [
    {
      roles: ['user', 'admin'],
      component: (
        <TabsTrigger key="budget" value="budget">
          Budget
        </TabsTrigger>
      ),
    },
    {
      roles: ['admin'],
      component: (
        <TabsTrigger key="users" value="users">
          Utenti
        </TabsTrigger>
      ),
    },
  ];

  const filteredTabs = tabs
    .filter((tab) => tab.roles.includes(role))
    .map((tab) => tab.component);

  return (
    <TabsList className={`grid w-full grid-cols-${filteredTabs.length || 1}`}>
      {filteredTabs}
    </TabsList>
  );
};

const generateDashboardBody = (role: string) => {
  const tabs = [
    {
      roles: ['user', 'admin'],
      component: (
        <TabsContent key="budget" value="budget">
          <BudgetDashbord />
        </TabsContent>
      ),
    },
    {
      roles: ['admin'],
      component: (
        <TabsContent key="users" value="users">
          <UserDashboard />
        </TabsContent>
      ),
    },
  ];

  return tabs
    .filter((tab) => tab.roles.includes(role))
    .map((tab) => tab.component);
};

const Dashboard: React.FC = () => {
  const role = useSelector(selectUserRole);
  return (
    <Tabs defaultValue="budget" className="w-full">
      {generateDashboardTabs(role ?? '')}
      {generateDashboardBody(role ?? '')}
    </Tabs>
  );
};

export default Dashboard;
