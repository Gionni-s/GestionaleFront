'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import axios from '@/services/axios';
import { PlusCircle, Pencil, Trash, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';

// Definizione più chiara dei tipi
interface Item {
  _id: string;
  name: string;
}

type CategoryKey = 'foodGroups' | 'locations' | 'warehouses' | 'cookbook';
type Categories = Record<CategoryKey, Item[]>;

interface CategoryConfig {
  title: string;
  key: CategoryKey;
  url: string;
}

// Service functions optimized
const api = {
  async fetchData(url: string): Promise<Item[]> {
    try {
      const response = await axios.get<Item[]>(url);
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from ${url}:`, error);
      throw error;
    }
  },

  async createItem(url: string, name: string): Promise<Item> {
    const response = await axios.post(url, { name });
    return response.data;
  },

  async updateItem(url: string, id: string, name: string): Promise<Item> {
    const response = await axios.put(`${url}/${id}`, { name });
    return response.data;
  },

  async deleteItem(url: string, id: string): Promise<void> {
    await axios.delete(`${url}/${id}`);
  },
};

const Labels = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<Categories>({
    foodGroups: [],
    locations: [],
    warehouses: [],
    cookbook: [],
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    itemName: '',
    currentCategory: '' as CategoryKey,
    currentUrl: '',
    editingId: '',
  });

  // Category configuration maps
  const categoryConfigs: CategoryConfig[] = [
    {
      title: t('foodGroups'),
      key: 'foodGroups',
      url: '/food-groups',
    },
    {
      title: t('locations'),
      key: 'locations',
      url: '/locations',
    },
    {
      title: t('warehouses'),
      key: 'warehouses',
      url: '/warehouses',
    },
    {
      title: t('cookBooks'),
      key: 'cookbook',
      url: '/cookBooks',
    },
  ];

  // URL to key mapping for easier reference
  const urlToCategoryKey: Record<string, CategoryKey> = {
    '/food-groups': 'foodGroups',
    '/locations': 'locations',
    '/warehouses': 'warehouses',
    '/cookBooks': 'cookbook',
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const results = await Promise.all(
        categoryConfigs.map((config) =>
          api.fetchData(config.url).then((data) => ({ key: config.key, data }))
        )
      );

      const newCategories = { ...categories };
      results.forEach(({ key, data }) => {
        newCategories[key] = data;
      });

      setCategories(newCategories);
    } catch (error) {
      toast({
        title: 'Error loading data',
        description: 'Failed to load categories. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalOpen = (url: string, item?: Item) => {
    const categoryKey = urlToCategoryKey[url];
    setModalState({
      isOpen: true,
      itemName: item?.name || '',
      currentCategory: categoryKey,
      currentUrl: url,
      editingId: item?._id || '',
    });
  };

  const handleModalClose = () => {
    setModalState({
      isOpen: false,
      itemName: '',
      currentCategory: '' as CategoryKey,
      currentUrl: '',
      editingId: '',
    });
  };

  const handleSave = async () => {
    const { itemName, currentUrl, currentCategory, editingId } = modalState;

    if (!itemName.trim()) return;

    setActionLoading(true);
    try {
      let updatedItem: Item;

      if (editingId) {
        updatedItem = await api.updateItem(currentUrl, editingId, itemName);
        toast({
          title: 'Success',
          description: 'Item updated successfully',
        });
      } else {
        updatedItem = await api.createItem(currentUrl, itemName);
        toast({
          title: 'Success',
          description: 'Item created successfully',
        });
      }

      setCategories((prev) => {
        const result = { ...prev };

        if (editingId) {
          result[currentCategory] = prev[currentCategory].map((item) =>
            item._id === editingId ? updatedItem : item
          );
        } else {
          result[currentCategory] = [
            ...(prev[currentCategory]?.length > 0 ? prev[currentCategory] : []),
            updatedItem,
          ];
        }

        return result;
      });

      handleModalClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: editingId
          ? 'Failed to update item'
          : 'Failed to create item',
        variant: 'destructive',
      });
      console.error('Error saving item:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (item: Item, url: string) => {
    const categoryKey = urlToCategoryKey[url];

    try {
      setActionLoading(true);
      await api.deleteItem(url, item._id);

      setCategories((prev) => ({
        ...prev,
        [categoryKey]: prev[categoryKey].filter((el) => el._id !== item._id),
      }));

      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
      });
      console.error('Error deleting item:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="ml-2 text-lg text-gray-700">{t('loadings')}</span>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {categoryConfigs.map(({ title, key, url }) => (
        <Card
          key={url}
          className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border border-gray-200"
        >
          <CardHeader className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 text-white py-4 px-6 flex justify-between items-center">
            <CardTitle className="text-lg font-semibold flex items-center">
              <span>{title}</span>
              <span className="ml-2 bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full">
                {categories[key]?.length || 0}
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full"
              onClick={() => handleModalOpen(url)}
              disabled={actionLoading}
            >
              <PlusCircle className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent className="p-4 max-h-64 overflow-y-auto">
            {categories[key]?.length > 0 ? (
              <ul className="space-y-2">
                {categories[key].map((element) => (
                  <li
                    key={element._id}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg transition-all hover:bg-gray-100 border border-gray-100"
                  >
                    <span className="text-gray-800 text-base font-medium truncate max-w-[150px]">
                      {element.name}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-gray-600 hover:text-indigo-600"
                        onClick={() => handleModalOpen(url, element)}
                        disabled={actionLoading}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-50 hover:border-red-300"
                        onClick={() => handleDelete(element, url)}
                        disabled={actionLoading}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex justify-center items-center h-32 text-gray-400">
                <span className="text-sm italic">{t('noElementFounds')}</span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      <Dialog
        open={modalState.isOpen}
        onOpenChange={(open) => !open && handleModalClose()}
      >
        <DialogContent className="p-6 rounded-lg max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800">
              {modalState.editingId ? t('updateItem') : t('addNewItem')}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <Input
              type="text"
              placeholder={t('enterName')}
              value={modalState.itemName}
              onChange={(e) =>
                setModalState((prev) => ({ ...prev, itemName: e.target.value }))
              }
              className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
            />
          </div>
          <DialogFooter className="mt-6 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleModalClose}
              disabled={actionLoading}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!modalState.itemName.trim() || actionLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {modalState.editingId ? t('updating') : t('saving')}
                </>
              ) : modalState.editingId ? (
                t('update')
              ) : (
                t('save')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Labels;
