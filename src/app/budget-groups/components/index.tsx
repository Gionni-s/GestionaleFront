'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/services/axios';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Select from '@/components/Select';
import Table from '@/components/Table';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { useToast } from '@/hooks/use-toast';
import { BudgetGroup, BudgetType, FormData } from '../types';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/Modal';

const intervalPeriods = [
  { _id: 'day', name: 'day' },
  { _id: 'week', name: 'week' },
  { _id: 'month', name: 'month' },
  { _id: 'year', name: 'year' },
];

const initialFormState: FormData = {
  name: '',
  max: 0,
  number: 1,
  interval: 'month',
  userId: '',
  type: { _id: 'expense', name: 'expense' },
};

const types: BudgetType[] = [
  { _id: 'expense', name: 'expense' },
  { _id: 'saving', name: 'saving' },
];

const BudgetGroupComponent: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [budgetGroups, setBudgetGroups] = useState<BudgetGroup[]>([]);
  const [form, setForm] = useState<FormData>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBudgetGroups();
  }, []);

  const fetchBudgetGroups = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.get<BudgetGroup[]>(
        '/budget-groups-template?sort=name'
      );
      setBudgetGroups(response.data || []);
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch budgets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const formattedForm = {
        name: form.name.trim(),
        max: form.max,
        resetPeriod: {
          number: form.number,
          interval: form.interval,
        },
        userId: form.userId,
      };

      if (editingId) {
        await axios.put(`/budget-groups-template/${editingId}`, formattedForm);
        toast({
          title: 'Success',
          description: 'Budget updated successfully',
        });
      } else {
        await axios.post('/budget-groups-template', formattedForm);
        toast({
          title: 'Success',
          description: 'Budget created successfully',
        });
      }

      setModalVisible(false);
      resetForm();
      fetchBudgetGroups();
    } catch (error) {
      console.error('Failed to save budget:', error);
      toast({
        title: 'Error',
        description: 'Failed to save budget',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id: string): void => {
    setBudgetToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async (): Promise<void> => {
    if (!budgetToDelete) return;

    setLoading(true);
    try {
      await axios.delete(`/budget-groups-template/${budgetToDelete}`);
      toast({
        title: 'Success',
        description: 'Budget deleted successfully',
      });
      fetchBudgetGroups();
    } catch (error) {
      console.error('Failed to delete budget:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete budget',
        variant: 'destructive',
      });
    } finally {
      setDeleteModalOpen(false);
      setBudgetToDelete(null);
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(initialFormState);
    setEditingId(null);
  };

  const handleEdit = (budget: BudgetGroup) => {
    setForm({
      name: budget.name,
      max: budget.max,
      number: budget.resetPeriod.number,
      interval: budget.resetPeriod.interval,
      userId: budget.userId,
      type: budget.type,
    });
    setEditingId(budget._id);
    setModalVisible(true);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  return (
    <div className="w-full flex flex-col p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('budgetManagements')}</h1>
        <Modal
          onOpen={() => {
            resetForm();
            setEditingId(null);
          }}
          onSave={handleSubmit}
          title={editingId ? t('editFoods') : t('addFoods')}
          triggerText={t('addFoods')}
          icon={<PlusCircle className="mr-2 h-4 w-4" />}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('names')}</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">{t('maxBudgets')} (€)</Label>
              <Input
                id="max"
                type="number"
                min="0"
                step="0.01"
                value={form.max}
                onChange={(e) => setForm({ ...form, max: +e.target.value })}
                disabled={loading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{t('types')}</Label>
              <Select
                label={t('selectTypes')}
                body={types}
                form={form}
                setForm={setForm}
                fieldToMap="type"
                base={form.type}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resetPeriod">{t('resetIntervals')}</Label>
              <div className="flex gap-2">
                <Input
                  id="resetPeriod"
                  type="number"
                  min="1"
                  value={form.number}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      number: +e.target.value,
                    })
                  }
                  disabled={loading}
                  className="w-24"
                  required
                />
                <div className="flex-1">
                  <Select
                    label="Select an interval"
                    body={intervalPeriods}
                    form={form}
                    setForm={setForm}
                    fieldToMap="interval"
                    base={form.interval}
                  />
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>

      <div className="border rounded-lg overflow-hidden shadow-sm">
        {loading && budgetGroups.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {t('loadings')}
          </div>
        ) : budgetGroups.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {t('noElementFounds')}
          </div>
        ) : (
          <Table
            head={[
              t('names'),
              t('maxBudgets'),
              t('resetPeriods'),
              { label: t('actions'), className: 'w-[100px]' },
            ]}
            body={budgetGroups}
            bodyKeys={[
              'name',
              'max',
              'resetPeriod.number|resetPeriod.interval',
            ]}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            columnConfig={{
              max: { format: (val) => '€' + val },
            }}
          />
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
};

export default BudgetGroupComponent;
