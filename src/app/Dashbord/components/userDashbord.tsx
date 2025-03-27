'use client'; // Ensures this is a client-side component

import React, { useEffect, useState } from 'react';
import axios from '@/services/axios/index';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Table from '@/components/Table';

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

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const response = await axios.get('/users');
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        setUsers(response.data);
      }
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p className="text-center text-gray-500 text-lg">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 text-lg">{error}</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Dashboard - Registered Users
      </h1>
      <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
        <Table
          head={['Avatar', 'Name', 'Surname', 'Email', 'Role', 'Last Login']}
          body={users}
          bodyKeys={[
            'profileImage',
            'name',
            'surname',
            'email',
            'role',
            'lastLogin',
          ]}
          disableActions={true}
          columnConfig={{
            profileImage: {
              format: (_, entity) => (
                <Avatar className="w-10 h-10 rounded-full border border-gray-300 shadow-sm">
                  <AvatarImage
                    src={entity.profileImage}
                    alt={`${entity.name} ${entity.surname}`}
                  />
                  <AvatarFallback className="text-gray-500">
                    {entity.name[0]}
                    {entity.surname[0]}
                  </AvatarFallback>
                </Avatar>
              ),
            },
            role: {
              format: (_, entity) => <Badge>{entity.role}</Badge>,
            },
            lastLogin: {
              format: (date) => new Date(date).toLocaleDateString(),
            },
          }}
        />
      </div>
    </div>
  );
};

export default UserDashboard;
