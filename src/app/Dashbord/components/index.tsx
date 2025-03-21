'use client'; // Ensures this is a client-side component

import React, { useEffect, useState } from 'react';
import axios from '@/services/axios/index';
import {
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableHeader,
  TableBody,
} from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Dashboard: React.FC = () => {
  const [users, setUsers] = useState<Array<{
    _id: string;
    name: string;
    surname: string;
    role: string;
    email: string;
    lastLogin: string;
    profileImage: string;
  }> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
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
    };

    fetchUsers();
  }, []);

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
        <Table className="min-w-full bg-white text-sm">
          <TableHeader>
            <TableRow className="bg-gray-50 text-gray-700">
              <TableHead className="px-6 py-3">Avatar</TableHead>
              <TableHead className="px-6 py-3">Name</TableHead>
              <TableHead className="px-6 py-3">Surname</TableHead>
              <TableHead className="px-6 py-3">Email</TableHead>
              <TableHead className="px-6 py-3">Role</TableHead>
              <TableHead className="px-6 py-3">Last Login</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <TableRow
                  key={user._id}
                  className="hover:bg-gray-100 border-b transition"
                >
                  <TableCell className="px-6 py-4">
                    <Avatar className="w-10 h-10 rounded-full border border-gray-300 shadow-sm">
                      <AvatarImage
                        src={user.profileImage}
                        alt={`${user.name} ${user.surname}`}
                      />
                      <AvatarFallback className="text-gray-500">
                        {user.name[0]}
                        {user.surname[0]}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="px-6 py-4 font-medium text-gray-900">
                    {user.name}
                  </TableCell>
                  <TableCell className="px-6 py-4">{user.surname}</TableCell>
                  <TableCell className="px-6 py-4 font-medium text-gray-900">
                    {user.email}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge>{user.role}</Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    {user.lastLogin
                      ? new Date(
                          user.lastLogin?.split('T')[0]
                        ).toLocaleDateString()
                      : ''}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Dashboard;
