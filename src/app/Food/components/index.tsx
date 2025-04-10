'use client';
import React, { useState, useEffect } from 'react';
import axios from '@/services/axios/index';
import Select from '@/components/Select';
import { Label } from '@/components/ui/label';
import { PlusCircle, Pencil, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Table from '@/components/Table';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/Modal';

// Define types for data
interface Food {
  _id: string;
  name: string;
  foodGroupId: string;
  foodGroup: { name: string };
  userId: string;
}

interface AlthernativeFood {
  message: string;
}

interface FormData {
  name: string;
  foodGroupId: string;
  userId: string;
}

const Foods: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [Foods, setFoods] = useState<Food[]>([]);
  const [form, setForm] = useState<FormData>({
    name: '',
    foodGroupId: '',
    userId: '',
  });
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [foodGroups, setFoodGroups] = useState<{ _id: string; name: string }[]>(
    []
  );
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
      const response = await axios.get<Food[]>('/foods?sort=scadenza');
      setFoods(response.data || []);
    } catch (err) {
      // setError('Failed to fetch warehouse entities.');
      console.error(err);
    }
  };

  const fetchFoodGroups = async () => {
    try {
      const response = await axios.get('/food-groups');
      setFoodGroups(response.data || []);
    } catch (error) {
      console.error('Failed to fetch food groups:', error);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    const submissionForm = { ...form };

    try {
      if (editingId) {
        await axios.put(`/foods/${editingId}`, submissionForm);
      } else {
        await axios.post('/foods', submissionForm);
      }
      resetForm();
      setEditingId(undefined);
      await fetchFoods();
    } catch (error) {
      console.error('Failed to save warehouse entity:', error);
      setError('Failed to save warehouse entity');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await axios.delete(`/foods/${id}`);
      await fetchFoods();
    } catch (error) {
      console.error('Failed to delete warehouse entity:', error);
      setError('Failed to delete warehouse entity');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      foodGroupId: '',
      userId: '',
    });
  };

  const handleEdit = (foods: Food) => {
    setForm({
      name: foods.name,
      foodGroupId: foods.foodGroupId,
      userId: foods.userId,
    });
    setEditingId(foods._id);
  };

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
            { label: t('Actions'), className: 'w-[100px]' },
          ]}
          body={Foods}
          bodyKeys={['name', 'foodGroup.name']}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default Foods;
