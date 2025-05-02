'use client';
import React, { useState, useEffect } from 'react';
import FoodApi from '@/services/axios/Food';
import Select from '@/components/Select';
import { Label } from '@/components/ui/label';
import { PlusCircle, Pencil, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Table from '@/components/Table';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/Modal';
import axios from '@/services/axios/index';
import { Food, FoodFormData } from '@/app/food/types';
import { FoodGroup } from '@/app/label/types';

const Foods: React.FC = () => {
  const { t } = useTranslation();
  const [foods, setFoods] = useState<Food[]>([]);
  const [form, setForm] = useState<FoodFormData>({
    name: '',
    foodGroupId: '',
    userId: '',
  });
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [foodGroups, setFoodGroups] = useState<FoodGroup[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchFoods(), fetchFoodGroups()]);
      } catch (err) {
        setError('Failed to fetch initial data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchFoods = async (): Promise<void> => {
    try {
      const response = await FoodApi.get('sort=scadenza');
      setFoods(response || []);
    } catch (err) {
      console.error('Failed to fetch foods:', err);
    }
  };

  const fetchFoodGroups = async (): Promise<void> => {
    try {
      const response = await axios.get<FoodGroup[]>('/food-groups');
      setFoodGroups(response.data || []);
    } catch (error) {
      console.error('Failed to fetch food groups:', error);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    const submissionForm = { ...form };

    try {
      if (editingId) {
        await FoodApi.put(editingId, submissionForm);
      } else {
        await FoodApi.post(submissionForm);
      }
      resetForm();
      setEditingId(undefined);
      await fetchFoods(); // Call fetchFoods instead of FoodApi.getFoods directly
    } catch (error) {
      console.error('Failed to save food:', error);
      setError('Failed to save food');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await FoodApi.delete(id);
      await fetchFoods(); // Call fetchFoods to update the state
    } catch (error) {
      console.error('Failed to delete food:', error);
      setError('Failed to delete food');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      foodGroupId: '',
      userId: '',
    });
  };

  const handleEdit = (food: Food) => {
    setForm({
      name: food.name,
      foodGroupId: food.foodGroupId, // Use _id from foodGroup
      userId: food.userId || '', // Add userId or empty string if not provided
    });
    setEditingId(food._id);
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const formGenerator = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('foodManagements')}</h1>
        <Modal
          onSave={handleSubmit}
          onCancel={() => {
            resetForm();
            setEditingId(undefined);
          }}
          title={editingId ? t('editFoods') : t('addFoods')}
          triggerText={t('addFoods')}
          icon={<PlusCircle className="mr-2 h-4 w-4" />}
          isEdit={editingId}
          editText={t('edit')}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">{t('names')}</Label>
              <Input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="food">{t('foodGroups')}</Label>
              <Select
                label={t('selectFoods')}
                body={foodGroups}
                form={form}
                setForm={setForm}
                fieldToMap="foodGroupId"
                useCombobox={true}
              />
            </div>
          </div>
        </Modal>
      </div>
    );
  };

  return (
    <div className="w-full mx-auto">
      {formGenerator()}
      <div className="border rounded-lg overflow-hidden">
        <Table
          head={[
            t('names'),
            t('foodGroups'),
            { label: t('actions'), className: 'w-[100px]' },
          ]}
          body={foods}
          bodyKeys={['name', 'foodGroup.name']}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default Foods;
