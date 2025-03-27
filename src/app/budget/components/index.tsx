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
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Table from '@/components/Table';

interface User {
  _id: string;
  email: string;
  name: string;
  surname: string;
}

interface BudgetGroup {
  _id: string;
  name: string;
  max: number;
  userId: string;
}

interface Budget {
  _id: string;
  name: string;
  amount: number;
  amountType: String;
  beneficiary: string;
  groupId: string;
  'Budget-Group': BudgetGroup;
  note: string;
  dateTime: string;
  userId: string;
  User: User;
}

interface FormData {
  name: string;
  amount: number;
  amountType: String;
  beneficiary: string;
  groupId: string;
  note: string;
  dateTime: string;
  userId: string;
}

interface BudgetGroupKpi {
  _id: string;
  name: string;
  total: number;
  max: number;
}

const BudgetComponent: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [groupBudgetsKpi, setGroupBudgetsKpi] = useState<BudgetGroupKpi[]>([]);
  const [budgetGroups, setBudgetGroups] = useState<BudgetGroup[]>([]);
  const [form, setForm] = useState<FormData>({
    name: '',
    amount: 0,
    beneficiary: '',
    groupId: '',
    amountType: '€',
    note: '',
    dateTime: '',
    userId: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBudgets();
    fetchBudgetGroups();
    fetchKpi();
  }, []);

  const fetchKpi = async (): Promise<void> => {
    try {
      const response = await axios.get<BudgetGroupKpi[]>('/budget-groups/kpi');
      setGroupBudgetsKpi(response.data || []);
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
      setError('Failed to fetch budgets');
    }
  };

  const fetchBudgets = async (): Promise<void> => {
    try {
      const response = await axios.get<Budget[]>('/budgets');
      setBudgets(response.data || []);
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
      setError('Failed to fetch budgets');
    }
  };

  const fetchBudgetGroups = async (): Promise<void> => {
    try {
      const response = await axios.get<BudgetGroup[]>('/budget-groups');
      setBudgetGroups(response.data || []);
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
      setError('Failed to fetch budgets');
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/budgets/${editingId}`, form);
      } else {
        await axios.post('/budgets', form);
      }
      setModalVisible(false);
      resetForm();
      setEditingId(null);
      fetchBudgets();
    } catch (error) {
      console.error('Failed to save budget:', error);
      setError('Failed to save budget');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await axios.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch (error) {
      console.error('Failed to delete budget:', error);
      setError('Failed to delete budget');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      amount: 0,
      beneficiary: '',
      amountType: '€',
      groupId: '',
      note: '',
      dateTime: '',
      userId: '',
    });
  };

  const handleEdit = (budget: Budget) => {
    setForm({
      name: budget.name,
      amount: budget.amount,
      beneficiary: budget.beneficiary,
      amountType: '€',
      groupId: budget.groupId,
      note: budget.note,
      dateTime: budget.dateTime,
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
                <Label htmlFor="importo">Importo</Label>
                <Input
                  id="importo"
                  type="number"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({ ...form, amount: +e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.dateTime}
                  onChange={(e) =>
                    setForm({ ...form, dateTime: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="importo">Groups </Label>
                <Select
                  label="Seleziona un gruppo"
                  body={budgetGroups}
                  form={form}
                  setForm={setForm}
                  fieldToMap="groupId"
                  useCombobox={true}
                />
              </div>
              <div>
                <Label htmlFor="importo">Note </Label>
                <Input
                  id="note"
                  type="text"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="importo">Beneficiario</Label>
                <Input
                  id="note"
                  type="text"
                  value={form.beneficiary}
                  onChange={(e) =>
                    setForm({ ...form, beneficiary: e.target.value })
                  }
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
        <Table
          head={[
            'Name',
            'Importo',
            'Group',
            'Date',
            { label: 'Actions', className: 'w-[100px]' },
          ]}
          body={budgets}
          bodyKeys={[
            'name',
            'amountType|amount',
            'Budget-Group.name',
            'dateTime',
          ]}
          onEdit={handleEdit}
          onDelete={handleDelete}
          columnConfig={{
            dateTime: {
              format: (value) => formatDate(value),
            },
          }}
        />
      </div>
    </div>
  );
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString();
}

export default BudgetComponent;
