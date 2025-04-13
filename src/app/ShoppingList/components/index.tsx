'use client';

import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import {
  PlusCircle,
  CheckCircle,
  Circle,
  Trash2,
  Edit,
  ShoppingCart,
  Save,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/Modal';
import { ShoppingList, ShoppingListFormData } from '../types';
import ShoppingListApi from '@/services/axios/ShoppingList';
import FoodApi from '@/services/axios/Food';
import { useToast } from '@/hooks/use-toast';
import Select from '@/components/Select';
import { Button } from '@/components/ui/button';

const ShoppingLists: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [form, setForm] = useState<ShoppingListFormData>({
    foodId: '',
    quantity: 1,
  });
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [foodItems, setFoodItems] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [quickAdd, setQuickAdd] = useState<string>('');
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

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

  const fetchShoppingLists = async (
    params: string = 'status=toBuy'
  ): Promise<void> => {
    try {
      const response = await ShoppingListApi.get(params);
      setShoppingLists(response || []);

      // Inizializza gli elementi completati basandosi sullo status
      const completed = new Set<string>();
      response?.forEach((item) => {
        if (item.status === 'completed') {
          completed.add(item._id);
        }
      });
      setCompletedItems(completed);
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
      const response = await FoodApi.get();
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
        await ShoppingListApi.put(editingId, form);
        toast({
          title: t('success'),
          description: t('shoppingListUpdated'),
          variant: 'default',
        });
      } else {
        await ShoppingListApi.post(form);
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
      await ShoppingListApi.delete(id);
      toast({
        title: t('success'),
        description: t('shoppingListDeleted'),
        variant: 'default',
      });
      await fetchShoppingLists();
      setCompletedItems((prev) => {
        const updated = new Set(prev);
        updated.delete(id);
        return updated;
      });
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
      quantity: 1,
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

  const handleToggleComplete = (id: string) => {
    setCompletedItems((prev) => {
      const updated = new Set(prev);
      if (updated.has(id)) {
        updated.delete(id);
      } else {
        updated.add(id);
      }
      return updated;
    });
  };

  const handleQuickAdd = async () => {
    if (!quickAdd.trim()) return;

    // Find if the item already exists in food items
    const foodItem = foodItems.find(
      (item) => item.name.toLowerCase() === quickAdd.toLowerCase()
    );

    let foodId = '';

    if (foodItem) {
      foodId = foodItem._id;
    } else {
      // TODO: This would require an API to create a food item
      toast({
        title: t('error'),
        description: t('foodItemNotFound'),
        variant: 'destructive',
      });
      return;
    }

    try {
      await ShoppingListApi.post({
        foodId,
        quantity: 1,
      });
      setQuickAdd('');
      toast({
        title: t('success'),
        description: t('itemAdded'),
        variant: 'default',
      });
      await fetchShoppingLists();
    } catch (error) {
      console.error('Failed to add item:', error);
      toast({
        title: t('error'),
        description: t('failedToAddItem'),
        variant: 'destructive',
      });
    }
  };

  // Funzione per salvare tutti gli elementi completati
  const saveCompletedItems = async () => {
    if (completedItems.size === 0) {
      toast({
        title: t('info'),
        description: t('noCompletedItems'),
        variant: 'default',
      });
      return;
    }

    try {
      setLoading(true);

      const promises = Array.from(completedItems).map((id) =>
        ShoppingListApi.putStatus(id, { status: 'bought' })
      );

      await Promise.all(promises);

      toast({
        title: t('success'),
        description: t('completedItemsSaved'),
        variant: 'default',
      });

      // Ricaricare la lista
      await fetchShoppingLists();
    } catch (error) {
      console.error('Failed to save completed items:', error);
      toast({
        title: t('error'),
        description: t('failedToSaveCompletedItems'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('shoppingLists')}</h1>
        <div className="flex gap-2">
          {completedItems.size > 0 && (
            <Button
              onClick={saveCompletedItems}
              variant="outline"
              className="flex items-center gap-1"
            >
              <Save className="h-4 w-4" />
              {t('saveCompleted')} ({completedItems.size})
            </Button>
          )}
          <Modal
            onSave={handleSubmit}
            onCancel={resetForm}
            title={editingId ? t('editShoppingList') : t('add')}
            triggerText={t('add')}
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
                    setForm({
                      ...form,
                      quantity: parseInt(e.target.value) || 1,
                    })
                  }
                  min={1}
                  required
                />
              </div>
            </div>
          </Modal>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          {shoppingLists.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>{t('noItemsInShoppingList')}</p>
              <p className="text-sm">{t('addItemsToGetStarted')}</p>
            </div>
          ) : (
            <ul className="divide-y">
              {shoppingLists.map((item) => {
                const isCompleted =
                  completedItems.has(item._id) || item.status === 'completed';
                return (
                  <li
                    key={item._id}
                    className={`p-4 flex items-center justify-between hover:bg-gray-50 ${
                      isCompleted ? 'bg-gray-100' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-grow">
                      <button
                        onClick={() => handleToggleComplete(item._id)}
                        className="focus:outline-none"
                        aria-label={
                          isCompleted
                            ? t('markAsIncomplete')
                            : t('markAsComplete')
                        }
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      <span
                        className={`flex-grow ${
                          isCompleted ? 'line-through text-gray-500' : ''
                        }`}
                      >
                        {item.food?.name}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {t('quantity')}: {item.quantity}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 text-blue-500 hover:text-blue-700"
                        aria-label={t('edit')}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-1 text-red-500 hover:text-red-700"
                        aria-label={t('delete')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ShoppingLists;
