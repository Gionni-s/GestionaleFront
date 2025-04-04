'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from '@/services/axios/index';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Table from '@/components/Table';
import { Skeleton } from '@/components/ui/skeleton';

interface User {
  _id: string;
  name: string;
  surname: string;
  role: string;
  email: string;
  lastLogin: string;
  profileImage: string;
}

const UserDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const columnConfig = {
    profileImage: {
      format: (_: any, entity: any) => (
        <Avatar className="w-10 h-10 rounded-full border border-gray-300 shadow-sm">
          <AvatarImage
            src={entity.profileImage}
            alt={`${entity.name} ${entity.surname}`}
            onError={(e) => {
              // Handle image loading errors
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <AvatarFallback className="text-gray-500">
            {entity.name?.[0] || ''}
            {entity.surname?.[0] || ''}
          </AvatarFallback>
        </Avatar>
      ),
    },
    role: {
      format: (_: any, entity: any) => (
        <Badge variant="outline">{entity.role}</Badge>
      ),
    },
    lastLogin: {
      format: (date: string) =>
        date ? new Date(date).toLocaleDateString() : 'Never',
    },
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/users');

      // Simplified logic - response.data will be set regardless of type
      setUsers(
        Array.isArray(response.data)
          ? response.data
          : response.data && typeof response.data === 'object'
          ? [response.data]
          : []
      );
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const tableHeaders = [
    'Avatar',
    'Name',
    'Surname',
    'Email',
    'Role',
    'Last Login',
  ];
  const tableBodyKeys = [
    'profileImage',
    'name',
    'surname',
    'email',
    'role',
    'lastLogin',
  ];

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Dashboard - Registered Users
        </h1>
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Dashboard - Registered Users
        </h1>
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-center text-red-500 text-lg">{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md mx-auto block"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard - Registered Users
        </h1>
        <span className="text-gray-500">Total Users: {users.length}</span>
      </div>

      {users.length === 0 ? (
        <div className="p-6 text-center bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500">No users found</p>
        </div>
      ) : (
        <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
          <Table
            head={tableHeaders}
            body={users}
            bodyKeys={tableBodyKeys}
            disableActions={true}
            columnConfig={columnConfig}
          />
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
