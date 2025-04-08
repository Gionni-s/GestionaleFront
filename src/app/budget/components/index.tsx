'use client';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Budget, BudgetGroup, BudgetGroupKpi, FormData, Kpi } from '../types';
import { PlusCircle, Filter } from 'lucide-react';
import axios from '@/services/axios';
import { budgetSave, selectKpiIds } from '@/services/store/kpi';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Table from '@/components/Table';
import { Card } from '@/components/ui/card';
import { store } from '@/services/store';
import SelectKpiDialog from './selectKpi';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/Modal';
import { Label } from '@/components/ui/label';
import Select from '@/components/Select';

const KpiCard = React.memo(({ item }: { item: Kpi }) => {
  const progress = item.max > 0 ? (item.total / item.max) * 100 : 0;
  const progressColor =
    progress < 50
      ? 'bg-green-500'
      : progress < 80
      ? 'bg-yellow-500'
      : 'bg-red-500';

  return (
    <Card
      key={item._id}
      className="p-6 shadow-md border border-gray-300 rounded-lg min-h-[100px] min-w-[200px] bg-white hover:shadow-xl transition-shadow duration-300 flex-shrink-0"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {item.name} (€{item.max - item.total})
      </h3>
      <div className="relative w-full h-3 bg-gray-200 rounded-lg overflow-hidden">
        <div
          className={`h-full ${progressColor} transition-all duration-300`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center text-xs font-bold"
          style={{ color: progress > 50 ? 'white' : 'black' }}
        >
          {Math.round(progress)}%
        </div>
      </div>
      <p className="text-gray-600 mt-2 text-sm">
        <span className="font-medium text-gray-800">€{item.total}</span> / €
        {item.max}
      </p>
    </Card>
  );
});

KpiCard.displayName = 'KpiCard';

const KpiBar = React.memo(({ kpi }: { kpi: Kpi[] }) => {
  const { t } = useTranslation();

  if (!kpi?.length) {
    return (
      <div className="p-4 mb-4 text-gray-500 italic">{t('noKpiSelected')}</div>
    );
  }

  return (
    <div className="flex space-x-4 overflow-x-auto p-4 mb-4">
      {kpi.map((item) => (
        <KpiCard key={item._id} item={item} />
      ))}
    </div>
  );
});

KpiBar.displayName = 'KpiBar';

const formattedDate = (date?: string) => {
  const today = date ? new Date(date) : new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  return `${year}-${month}-${day}`;
};

const BudgetComponent: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const kpiIds = useSelector(selectKpiIds);

  // State management
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetGroups, setBudgetGroups] = useState<BudgetGroup[]>([]);
  const [groupBudgetsTemplate, setGroupBudgetsTemplate] = useState<
    BudgetGroupKpi[]
  >([]);
  const [selectedGroupBudgetsKpi, setSelectedGroupBudgetKpi] = useState<
    string[]
  >([]);
  const [visualizeGroupBudgetsKpi, setVisualizeGroupBudgetsKpi] = useState<
    Kpi[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal states
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalVisibleSelectKpi, setModalVisibleSelectKpi] =
    useState<boolean>(false);
  const [deleteModalData, setDeleteModalData] = useState<{
    isOpen: boolean;
    budgetId: string | null;
  }>({ isOpen: false, budgetId: null });

  // Form state
  const [form, setForm] = useState<FormData>({
    name: '',
    amount: 0,
    beneficiary: '',
    groupId: '',
    amountType: '€',
    note: '',
    dateTime: formattedDate(),
    userId: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Error handling
  const showError = useCallback(
    (message: string) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      });
    },
    [toast]
  );

  // Data fetching functions
  const fetchBudgets = useCallback(async (): Promise<void> => {
    try {
      const response = await axios.get<Budget[]>('/budgets');
      const sortedBudgets = response.data.sort(
        (a, b) =>
          new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      );
      setBudgets(sortedBudgets || []);
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
      showError('Failed to fetch budgets');
    }
  }, [showError]);

  const fetchBudgetGroups = useCallback(async (): Promise<void> => {
    try {
      const response = await axios.get<BudgetGroup[]>(
        '/budget-groups-template'
      );
      setBudgetGroups(response.data || []);
    } catch (err) {
      console.error('Failed to fetch budget groups:', err);
      showError('Failed to fetch budget groups');
    }
  }, [showError]);

  const fetchBudgetGroupsTemplate = useCallback(async (): Promise<void> => {
    try {
      const response = await axios.get<BudgetGroupKpi[]>(
        '/budget-groups-template'
      );
      setGroupBudgetsTemplate(response.data || []);
    } catch (err) {
      console.error('Failed to fetch KPIs:', err);
      showError('Failed to fetch KPIs');
    }
  }, [showError]);

  const loadKpiData = useCallback(
    async (ids: string[]): Promise<void> => {
      if (!ids?.length) return;

      try {
        setLoading(true);
        const response = await axios.get<Kpi[]>(
          `/budgets/kpi?kpi=${ids.join(',')}`
        );
        setVisualizeGroupBudgetsKpi(response.data || []);
      } catch (err) {
        console.error('Failed to load stored KPI data:', err);
        showError('Failed to load KPI data from store');
      } finally {
        setLoading(false);
      }
    },
    [showError]
  );

  // Filtered budgets using memoization
  const filteredBudgets = useMemo(() => {
    if (!searchTerm.trim()) return budgets;

    const lowerSearchTerm = searchTerm.toLowerCase();
    return budgets.filter(
      (budget) =>
        budget.name.toLowerCase().includes(lowerSearchTerm) ||
        budget.beneficiary.toLowerCase().includes(lowerSearchTerm) ||
        budget['Budget-Group']?.name.toLowerCase().includes(lowerSearchTerm)
    );
  }, [searchTerm, budgets]);

  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchBudgets(),
          fetchBudgetGroups(),
          fetchBudgetGroupsTemplate(),
        ]);
      } catch (error) {
        showError('Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [fetchBudgets, fetchBudgetGroups, fetchBudgetGroupsTemplate, showError]);

  // Load stored KPIs
  useEffect(() => {
    if (kpiIds?.length) {
      setSelectedGroupBudgetKpi(kpiIds);
      loadKpiData(kpiIds);
    }
  }, [kpiIds, loadKpiData]);

  // Form and data manipulation functions
  const resetForm = useCallback(() => {
    setForm({
      name: '',
      amount: 0,
      beneficiary: '',
      amountType: '€',
      groupId: '',
      note: '',
      dateTime: formattedDate(),
      userId: '',
    });
  }, []);

  const handleCheckboxChange = useCallback((group: BudgetGroupKpi) => {
    setSelectedGroupBudgetKpi((prev) =>
      prev.includes(group._id)
        ? prev.filter((g) => g !== group._id)
        : [...prev, group._id]
    );
  }, []);

  const handleEdit = useCallback((budget: Budget) => {
    setForm({
      name: budget.name,
      amount: budget.amount,
      beneficiary: budget.beneficiary,
      amountType: budget.amountType || '€',
      groupId: budget.groupId,
      note: budget.note,
      dateTime: budget.dateTime,
      userId: budget.userId,
    });
    setEditingId(budget._id);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback((id: string): void => {
    setDeleteModalData({ isOpen: true, budgetId: id });
  }, []);

  const handleChange = (field: keyof FormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // API interaction functions
  const handleSubmit = async (): Promise<void> => {
    try {
      setLoading(true);
      if (editingId) {
        await axios.put(`/budgets/${editingId}`, form);
        toast({
          title: 'Success',
          description: 'Budget updated successfully',
        });
      } else {
        await axios.post('/budgets', form);
        toast({
          title: 'Success',
          description: 'Budget created successfully',
        });
      }
      setModalVisible(false);
      resetForm();
      setEditingId(null);
      await fetchBudgets();

      // Reload KPI data after adding/updating budget
      if (selectedGroupBudgetsKpi.length > 0) {
        loadKpiData(selectedGroupBudgetsKpi);
      }
    } catch (error) {
      console.error('Failed to save budget:', error);
      showError('Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deleteModalData.budgetId) return;

    try {
      setLoading(true);
      await axios.delete(`/budgets/${deleteModalData.budgetId}`);
      await fetchBudgets();
      toast({
        title: 'Success',
        description: 'Budget deleted successfully',
      });

      // Reload KPI data after deleting budget
      if (selectedGroupBudgetsKpi.length > 0) {
        loadKpiData(selectedGroupBudgetsKpi);
      }
    } catch (error) {
      console.error('Failed to delete budget:', error);
      showError('Failed to delete budget');
    } finally {
      setLoading(false);
      setDeleteModalData({ isOpen: false, budgetId: null });
    }
  };

  const cancelDelete = useCallback((): void => {
    setDeleteModalData({ isOpen: false, budgetId: null });
  }, []);

  const handleKpiSubmit = async (): Promise<void> => {
    try {
      setLoading(true);
      store.dispatch(budgetSave({ ids: selectedGroupBudgetsKpi }));

      if (selectedGroupBudgetsKpi.length > 0) {
        const response = await axios.get<Kpi[]>(
          `/budgets/kpi?kpi=${selectedGroupBudgetsKpi.join(',')}`
        );
        setVisualizeGroupBudgetsKpi(response.data);
        toast({
          title: 'Success',
          description: 'KPIs updated successfully',
        });
      } else {
        setVisualizeGroupBudgetsKpi([]);
      }
    } catch (err) {
      console.error('Failed to update KPIs:', err);
      showError('Failed to update KPIs');
    } finally {
      setLoading(false);
      setModalVisibleSelectKpi(false);
    }
  };

  const handleAddNewBudget = useCallback(() => {
    resetForm();
    setEditingId(null);
    setModalVisible(true);
  }, [resetForm]);

  return (
    <div className="w-full flex flex-col p-2">
      <DeleteConfirmationModal
        isOpen={deleteModalData.isOpen}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('budgetManagements')}</h1>
        <div className="flex space-x-2">
          <SelectKpiDialog
            isOpen={modalVisibleSelectKpi}
            onOpenChange={setModalVisibleSelectKpi}
            onSubmit={handleKpiSubmit}
            groups={groupBudgetsTemplate}
            selectedGroups={selectedGroupBudgetsKpi}
            onToggleGroup={handleCheckboxChange}
            isLoading={loading}
          />

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
              <div>
                <Label htmlFor="name">{t('names')}</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="importo">{t('amounts')}</Label>
                <Input
                  id="importo"
                  type="number"
                  value={form.amount}
                  onChange={(e) => handleChange('amount', +e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="date">{t('dates')}</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.dateTime}
                  onChange={(e) => handleChange('dateTime', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="groupId">{t('groups')}</Label>
                <Select
                  label={t('selectGroups')}
                  body={budgetGroups}
                  form={form}
                  setForm={setForm}
                  fieldToMap="groupId"
                  useCombobox={true}
                />
              </div>
              <div>
                <Label htmlFor="note">{t('notes')}</Label>
                <Input
                  id="note"
                  type="text"
                  value={form.note}
                  onChange={(e) => handleChange('note', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="beneficiary">{t('beneficiaries')}</Label>
                <Input
                  id="beneficiary"
                  type="text"
                  value={form.beneficiary}
                  onChange={(e) => handleChange('beneficiary', e.target.value)}
                  required
                />
              </div>
            </div>
          </Modal>
        </div>
      </div>

      {loading && (
        <div className="w-full flex justify-center my-4">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-500">{t('loading')}</p>
          </div>
        </div>
      )}

      <KpiBar kpi={visualizeGroupBudgetsKpi} />

      <div className="mb-4">
        <div className="relative">
          <Input
            type="text"
            placeholder={
              t('searchPlaceholder') ||
              'Search by name, beneficiary or group...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table
          head={[
            t('names'),
            t('amounts'),
            t('groups'),
            t('dates'),
            t('beneficiaries'),
            { label: t('actions'), className: 'w-[100px]' },
          ]}
          body={filteredBudgets}
          bodyKeys={[
            'name',
            'amountType|amount',
            'Budget-Group.name',
            'dateTime',
            'beneficiary',
          ]}
          onEdit={handleEdit}
          onDelete={handleDelete}
          columnConfig={{
            dateTime: {
              format: formattedDate,
            },
          }}
        />
      </div>
    </div>
  );
};

export default BudgetComponent;
