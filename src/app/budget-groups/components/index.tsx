'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/services/axios';
import { Button } from '@/components/ui/button';
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
import Select from '@/components/Select';
import Table from '@/components/Table';

interface BudgetGroup {
  _id: string;
  name: string;
  max: number;
  resetPeriod: { number: 1; interval: 'month' };
  userId: string;
}

interface FormData {
  name: string;
  max: number;
  // resetPeriod: { number: number; interval: string };
  number: number;
  interval: string;
  userId: string;
}

const intervalPeriod = [
  { _id: 'day', name: 'day' },
  { _id: 'week', name: 'week' },
  { _id: 'month', name: 'month' },
  { _id: 'year', name: 'year' },
];

const BudgetGroupComponent: React.FC = () => {
  const [budgetGroups, setBudgetGroups] = useState<BudgetGroup[]>([]);
  const [form, setForm] = useState<FormData>({
    name: '',
    max: 0,
    number: 1,
    interval: 'month',
    userId: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgetGroups();
  }, []);

  const fetchBudgetGroups = async (): Promise<void> => {
    try {
      const response = await axios.get<BudgetGroup[]>(
        '/budget-groups-template?sort=name'
      );
      setBudgetGroups(response.data || []);
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
      setError('Failed to fetch budgets');
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formattedForm = {
        name: form.name,
        max: form.max,
        resetPeriod: {
          number: form.number,
          interval: form.interval,
        },
        userId: form.userId,
      };

      if (editingId) {
        await axios.put(`/budget-groups-template/${editingId}`, formattedForm);
      } else {
        await axios.post('/budget-groups-template', formattedForm);
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
      await axios.delete(`/budget-groups-template/${id}`);
      fetchBudgetGroups();
    } catch (error) {
      console.error('Failed to delete budget:', error);
      setError('Failed to delete budget');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      max: 0,
      number: 1,
      interval: 'month',
      userId: '',
    });
  };

  const handleEdit = (budget: BudgetGroup) => {
    setForm({
      name: budget.name,
      max: budget.max,
      number: budget.resetPeriod.number,
      interval: budget.resetPeriod.interval,
      userId: budget.userId,
    });
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
              <div>
                <Label htmlFor="resetPeriod">Reset interval</Label>
                <div style={{ display: 'flex' }}>
                  <Input
                    id="resetPeriod"
                    type="number"
                    value={form?.number}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        number: +e.target.value,
                      })
                    }
                    required
                  />
                  <Select
                    label="Seleziona un intervallo"
                    body={intervalPeriod}
                    form={form}
                    setForm={setForm}
                    fieldToMap="interval"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                {editingId ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table
          head={[
            'Name',
            'Max Budget',
            'Reset period',
            { label: 'Actions', className: 'w-[100px]' },
          ]}
          body={budgetGroups}
          bodyKeys={['name', 'max', 'resetPeriod.number|resetPeriod.interval']}
          onEdit={handleEdit}
          onDelete={handleDelete}
          columnConfig={{
            max: { format: (val) => '€' + val },
          }}
        />
      </div>
    </div>
  );
};

export default BudgetGroupComponent;
