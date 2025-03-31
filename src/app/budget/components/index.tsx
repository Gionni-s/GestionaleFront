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
import { PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Select from '@/components/Select';
import Table from '@/components/Table';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { store } from '@/services/store';
import { budgetSave, selectKpiIds } from '@/services/store/kpi';
import { useSelector } from 'react-redux';

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
  amountType: string;
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
  amountType: string;
  beneficiary: string;
  groupId: string;
  note: string;
  dateTime: string;
  userId: string;
}

interface Kpi {
  _id: string;
  name: string;
  max: number;
  total: number;
}

interface BudgetGroupKpi {
  _id: string;
  name: string;
}

interface SelectKpiDialogProps {
  modalVisibleSelectKpi: boolean;
  setModalVisibleSelectKpi: (visible: boolean) => void;
  handleKpiSubmit: () => Promise<void>;
  groupBudgetsTemplate: BudgetGroupKpi[];
  selecteGroupBudgetsKpi: string[];
  handleCheckboxChange: (group: BudgetGroupKpi) => void;
}

interface KpiBarProps {
  kpi: Kpi[];
}

const BudgetComponent: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [groupBudgetsTemplate, setGroupBudgetsTemplate] = useState<
    BudgetGroupKpi[]
  >([]);
  const [selecteGroupBudgetsKpi, setSelecteGroupBudgetKpi] = useState<string[]>(
    []
  );
  const [visualizeGroupBudgetsKpi, setVisualizeGroupBudgetsKpi] = useState<
    Kpi[]
  >([]);
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
  const [modalVisibleSelectKpi, setModalVisibleSelectKpi] =
    useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const kpiIds = useSelector(selectKpiIds);

  useEffect(() => {
    fetchBudgets();
    fetchBudgetGroups();
    fetchBudgetGroupsTemplate();
  }, []);

  useEffect(() => {
    if (kpiIds?.length) {
      setSelecteGroupBudgetKpi(kpiIds);
      // Automatically load KPI data when there are stored KPIs
      loadKpiData(kpiIds);
    }
  }, [kpiIds]);

  // Function to load KPI data from stored IDs
  const loadKpiData = async (ids: string[]): Promise<void> => {
    if (!ids || ids.length === 0) return;

    try {
      setLoading(true);
      const response = await axios.get<Kpi[]>(
        `/budgets/kpi?kpi=${ids.join(',')}`
      );
      setVisualizeGroupBudgetsKpi(response.data || []);
    } catch (err) {
      console.error('Failed to load stored KPI data:', err);
      setError('Failed to load KPI data from store');
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetGroupsTemplate = async (): Promise<void> => {
    try {
      const response = await axios.get<BudgetGroupKpi[]>(
        '/budget-groups-template'
      );
      setGroupBudgetsTemplate(response.data || []);
    } catch (err) {
      console.error('Failed to fetch KPIs:', err);
      setError('Failed to fetch KPIs');
    }
  };

  const fetchBudgets = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await axios.get<Budget[]>('/budgets');
      setBudgets(response.data || []);
    } catch (err) {
      console.error('Failed to fetch budgets:', err);
      setError('Failed to fetch budgets');
    } finally {
      setLoading(false);
    }
  };

  const fetchBudgetGroups = async (): Promise<void> => {
    try {
      const response = await axios.get<BudgetGroup[]>(
        '/budget-groups-template'
      );
      setBudgetGroups(response.data || []);
    } catch (err) {
      console.error('Failed to fetch budget groups:', err);
      setError('Failed to fetch budget groups');
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingId) {
        await axios.put(`/budgets/${editingId}`, form);
      } else {
        await axios.post('/budgets', form);
      }
      setModalVisible(false);
      resetForm();
      setEditingId(null);
      fetchBudgets();

      // Reload KPI data after adding/updating budget
      if (selecteGroupBudgetsKpi.length > 0) {
        loadKpiData(selecteGroupBudgetsKpi);
      }
    } catch (error) {
      console.error('Failed to save budget:', error);
      setError('Failed to save budget');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      await axios.delete(`/budgets/${id}`);
      fetchBudgets();

      // Reload KPI data after deleting budget
      if (selecteGroupBudgetsKpi.length > 0) {
        loadKpiData(selecteGroupBudgetsKpi);
      }
    } catch (error) {
      console.error('Failed to delete budget:', error);
      setError('Failed to delete budget');
    } finally {
      setLoading(false);
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

  const handleCheckboxChange = (group: BudgetGroupKpi) => {
    setSelecteGroupBudgetKpi((prev) =>
      prev.includes(group._id)
        ? prev.filter((g) => g !== group._id)
        : [...prev, group._id]
    );
  };

  const handleEdit = (budget: Budget) => {
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
  };

  const handleKpiSubmit = async (): Promise<void> => {
    try {
      setLoading(true);
      store.dispatch(budgetSave({ ids: selecteGroupBudgetsKpi }));
      if (selecteGroupBudgetsKpi.length > 0) {
        const response = await axios.get<Kpi[]>(
          `/budgets/kpi?kpi=${selecteGroupBudgetsKpi.join(',')}`
        );
        setVisualizeGroupBudgetsKpi(response.data);
      } else {
        setVisualizeGroupBudgetsKpi([]);
      }
    } catch (err) {
      console.error('Failed to fetch budget groups:', err);
      setError('Failed to fetch budget groups');
    } finally {
      setLoading(false);
      setModalVisibleSelectKpi(false);
    }
  };

  return (
    <div className="w-full flex flex-col p-2">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Budget Management</h1>
        <div className="flex space-x-2">
          <SelectKpiDialog
            modalVisibleSelectKpi={modalVisibleSelectKpi}
            setModalVisibleSelectKpi={setModalVisibleSelectKpi}
            handleKpiSubmit={handleKpiSubmit}
            groupBudgetsTemplate={groupBudgetsTemplate}
            selecteGroupBudgetsKpi={selecteGroupBudgetsKpi}
            handleCheckboxChange={handleCheckboxChange}
          />
          <Dialog open={modalVisible} onOpenChange={setModalVisible}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  resetForm();
                  setEditingId(null);
                  setModalVisible(true);
                }}
                disabled={loading}
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
                  <Label htmlFor="importo">Amount</Label>
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
                  <Label htmlFor="groupId">Groups</Label>
                  <Select
                    label="Select a group"
                    body={budgetGroups}
                    form={form}
                    setForm={setForm}
                    fieldToMap="groupId"
                    useCombobox={true}
                  />
                </div>
                <div>
                  <Label htmlFor="note">Note</Label>
                  <Input
                    id="note"
                    type="text"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="beneficiary">Beneficiary</Label>
                  <Input
                    id="beneficiary"
                    type="text"
                    value={form.beneficiary}
                    onChange={(e) =>
                      setForm({ ...form, beneficiary: e.target.value })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      {loading && (
        <div className="w-full flex justify-center my-4">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading...</p>
          </div>
        </div>
      )}
      <KpiBar kpi={visualizeGroupBudgetsKpi} />
      {error && (
        <div className="text-red-500 mb-4 p-2 bg-red-50 border border-red-200 rounded">
          {error}
          <Button
            variant="link"
            className="ml-2 text-red-500 p-0 h-auto"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}
      <div className="border rounded-lg overflow-hidden">
        <Table
          head={[
            'Name',
            'Amount',
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
  if (!date) return '';
  const dateObj = new Date(date);
  return isNaN(dateObj.getTime()) ? '' : dateObj.toLocaleDateString();
}

const KpiBar: React.FC<KpiBarProps> = ({ kpi }) => {
  return (
    <div className="flex space-x-4 overflow-x-auto p-4 mb-4">
      {kpi.map((item) => {
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
              {item.name}
            </h3>
            <div className="relative w-full h-3 bg-gray-200 rounded-lg overflow-hidden">
              <div
                className={`h-full ${progressColor} transition-all duration-300 flex items-center justify-center text-xs text-white font-bold`}
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              >
                {Math.round(progress)}%
              </div>
            </div>
            <p className="text-gray-600 mt-2 text-sm">
              <span className="font-medium text-gray-800">{item.total}</span> /{' '}
              {item.max}
            </p>
          </Card>
        );
      })}
    </div>
  );
};

const SelectKpiDialog: React.FC<SelectKpiDialogProps> = ({
  modalVisibleSelectKpi,
  setModalVisibleSelectKpi,
  handleKpiSubmit,
  groupBudgetsTemplate,
  selecteGroupBudgetsKpi,
  handleCheckboxChange,
}) => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleKpiSubmit();
  };

  return (
    <Dialog
      open={modalVisibleSelectKpi}
      onOpenChange={setModalVisibleSelectKpi}
    >
      <DialogTrigger asChild>
        <Button onClick={() => setModalVisibleSelectKpi(true)}>
          Select Group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Group</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            {groupBudgetsTemplate.length === 0 ? (
              <div className="text-gray-500">No groups available</div>
            ) : (
              groupBudgetsTemplate.map((group) => (
                <div key={group._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={group._id}
                    checked={selecteGroupBudgetsKpi.includes(group._id)}
                    onCheckedChange={() => handleCheckboxChange(group)}
                  />
                  <label htmlFor={group._id} className="text-sm font-medium">
                    {group.name}
                  </label>
                </div>
              ))
            )}
          </div>
          <Button type="submit" className="w-full">
            Select
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BudgetComponent;
