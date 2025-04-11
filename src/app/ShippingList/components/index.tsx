'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Table from '@/components/Table';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/Modal';
import { ShoppingList, ShoppingListFormData } from '../types';
import ShoppingListApi from '@/services/axios/ShoppingList';
import FoodApi from '@/services/axios/Food';
import { useToast } from '@/hooks/use-toast';
import Select from '@/components/Select';

const ShoppingLists: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [form, setForm] = useState<ShoppingListFormData>({
    foodId: '',
    quantity: 0,
  });
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  const [foodItems, setFoodItems] = useState<{ _id: string; name: string }[]>(
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([fetchShoppingLists(), fetchFoodItems()]);
      } catch (err) {
        toast({
          title: t('error'),
          description: t('failedToFetchInitialData'),
          variant: 'destructive',
        });
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchShoppingLists = async (): Promise<void> => {
    try {
      const response = await ShoppingListApi.getShoppingLists();
      setShoppingLists(response || []);
    } catch (err) {
      console.error('Failed to fetch shopping lists:', err);
      toast({
        title: t('error'),
        description: t('failedToFetchShoppingLists'),
        variant: 'destructive',
      });
    }
  };

  const fetchFoodItems = async () => {
    try {
      const response = await FoodApi.getFoods();
      setFoodItems(response || []);
    } catch (error) {
      console.error('Failed to fetch foods:', error);
      toast({
        title: t('error'),
        description: t('failedToFetchFoods'),
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (): Promise<void> => {
    if (!form.foodId) {
      toast({
        title: t('error'),
        description: t('pleaseSelectFood'),
        variant: 'destructive',
      });
      return;
    }

    try {
      if (editingId) {
        await ShoppingListApi.updateShoppingList(editingId, form);
        toast({
          title: t('success'),
          description: t('shoppingListUpdated'),
          variant: 'default',
        });
      } else {
        await ShoppingListApi.createShoppingList(form);
        toast({
          title: t('success'),
          description: t('shoppingListCreated'),
          variant: 'default',
        });
      }
      resetForm();
      await fetchShoppingLists();
    } catch (error) {
      console.error('Failed to save shopping list:', error);
      toast({
        title: t('error'),
        description: t('failedToSaveShoppingList'),
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await ShoppingListApi.deleteShoppingList(id);
      toast({
        title: t('success'),
        description: t('shoppingListDeleted'),
        variant: 'default',
      });
      await fetchShoppingLists();
    } catch (error) {
      console.error('Failed to delete shopping list:', error);
      toast({
        title: t('error'),
        description: t('failedToDeleteShoppingList'),
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setForm({
      foodId: '',
      quantity: 0,
    });
    setEditingId(undefined);
  };

  const handleEdit = (item: ShoppingList) => {
    setForm({
      foodId: item.foodId,
      quantity: item.quantity,
    });
    setEditingId(item._id);
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('shoppingLists')}</h1>
        <Modal
          onSave={handleSubmit}
          onCancel={resetForm}
          title={editingId ? t('editShoppingList') : t('addShoppingList')}
          triggerText={t('addShoppingList')}
          icon={<PlusCircle className="mr-2 h-4 w-4" />}
          isEdit={editingId}
          editText={t('edit')}
        >
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="food">{t('selectFood')}</Label>
              <Select
                label={t('selectFood')}
                body={foodItems}
                form={form}
                setForm={setForm}
                fieldToMap="foodId"
                useCombobox={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">{t('quantity')}</Label>
              <Input
                id="quantity"
                type="number"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: parseInt(e.target.value) || 0 })
                }
                min={0}
                required
              />
            </div>
          </div>
        </Modal>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table
            head={[
              t('name'),
              t('quantity'),
              { label: t('actions'), className: 'w-[100px]' },
            ]}
            body={shoppingLists}
            bodyKeys={['food.name', 'quantity']}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
};

export default ShoppingLists;
