'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/services/axios';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PlusCircle, Pencil, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface BudgetGroup {
  _id: string;
  name: string;
  max: number;
  total: number;
  remaining: number;
  userId: string;
}

interface FormData {
  name: string;
  max: number;
  userId: string;
}

const BudgetGroupComponent: React.FC = () => {
  const [budgetGroups, setBudgetGroups] = useState<BudgetGroup[]>([]);
  const [form, setForm] = useState<FormData>({ name: '', max: 0, userId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgetGroups();
  }, []);

  const fetchBudgetGroups = async (): Promise<void> => {
    try {
      const response = await axios.get<BudgetGroup[]>('/budget-groups/kpi');
      setBudgetGroups(response.data || []);
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
      setError('Failed to fetch budgets');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/budget-groups/${editingId}`, form);
      } else {
        await axios.post('/budget-groups', form);
      }
      setModalVisible(false);
      resetForm();
      setEditingId(null);
      fetchBudgetGroups();
    } catch (error) {
      console.error('Failed to save budget:', error);
      setError('Failed to save budget');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await axios.delete(`/budget-groups/${id}`);
      fetchBudgetGroups();
    } catch (error) {
      console.error('Failed to delete budget:', error);
      setError('Failed to delete budget');
    }
  };

  const resetForm = () => {
    setForm({ name: '', max: 0, userId: '' });
  };

  const handleEdit = (budget: BudgetGroup) => {
    setForm({ name: budget.name, max: budget.max, userId: budget.userId });
    setEditingId(budget._id);
    setModalVisible(true);
  };

  return (
    <div className="w-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Budget Management</h1>
        <Dialog open={modalVisible} onOpenChange={setModalVisible}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setEditingId(null);
                setModalVisible(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Budget
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Budget' : 'Add Budget'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="max">Max Budget</Label>
                <Input
                  id="max"
                  type="number"
                  value={form.max}
                  onChange={(e) => setForm({ ...form, max: +e.target.value })}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingId ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Max Budget</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Remaining Budget</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {budgetGroups.map((budget) => (
              <TableRow
                key={budget._id}
                className={budget.total > budget.max ? 'bg-red-200' : ''}
              >
                <TableCell>{budget.name}</TableCell>
                <TableCell>€{budget.max}</TableCell>
                <TableCell>€{budget.total}</TableCell>
                <TableHead>€{budget.remaining}</TableHead>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handleEdit(budget)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => handleDelete(budget._id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BudgetGroupComponent;
