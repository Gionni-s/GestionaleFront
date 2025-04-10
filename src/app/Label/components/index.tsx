'use client';

import { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import axios from '@/services/axios';
import { PlusCircle, Pencil, Trash, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import Table from '@/components/Table';
import Modal from '@/components/Modal';

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

  // Riferimento al bottone del modale
  const modalButtonRef = useRef(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<CategoryKey>('foodGroups');
  const [categories, setCategories] = useState<Categories>({
    foodGroups: [],
    locations: [],
    warehouses: [],
    cookbook: [],
  });

  const [modalState, setModalState] = useState({
    itemName: '',
    currentCategory: '' as CategoryKey,
    currentUrl: '',
    editingId: '',
    isEdit: false,
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
      itemName: item?.name || '',
      currentCategory: categoryKey,
      currentUrl: url,
      editingId: item?._id || '',
      isEdit: !!item,
    });

    if (modalButtonRef.current) {
      // @ts-ignore: Object is possibly 'null'.
      modalButtonRef.current.click();
    }
  };

  const handleModalClose = () => {
    setModalState({
      itemName: '',
      currentCategory: '' as CategoryKey,
      currentUrl: '',
      editingId: '',
      isEdit: false,
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

  const handleEdit = (item: Item) => {
    const activeConfig = categoryConfigs.find(
      (config) => config.key === activeTab
    );
    if (activeConfig) {
      handleModalOpen(activeConfig.url, item);
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

  const activeConfig = categoryConfigs.find(
    (config) => config.key === activeTab
  );

  return (
    <div className="w-full mx-auto">
      <Tabs
        defaultValue="foodGroups"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as CategoryKey)}
        className="w-full"
      >
        <TabsList className="mb-6 flex space-x-2 border-b border-gray-200 w-full">
          {categoryConfigs.map((config) => (
            <TabsTrigger
              key={config.key}
              value={config.key}
              className="px-4 py-2"
            >
              {config.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {categoryConfigs.map((config) => (
          <TabsContent key={config.key} value={config.key} className="mt-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">{config.title}</h1>

              <Modal
                onSave={handleSave}
                onCancel={handleModalClose}
                title={modalState.editingId ? t('edit') : t('add')}
                triggerText={t('add')}
                icon={<PlusCircle className="mr-2 h-4 w-4" />}
                onOpen={() => {
                  handleModalOpen(config.url);
                }}
                isEdit={modalState.editingId}
                editText={t('edit')}
              >
                <div className="space-y-4">
                  <Label htmlFor="itemName">{t('names')}</Label>
                  <Input
                    id="itemName"
                    type="text"
                    placeholder={t('enterName')}
                    value={modalState.itemName}
                    onChange={(e) =>
                      setModalState((prev) => ({
                        ...prev,
                        itemName: e.target.value,
                      }))
                    }
                    className="p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                    autoFocus
                  />
                </div>
              </Modal>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table
                head={[
                  t('names'),
                  { label: t('Actions'), className: 'w-[100px]' },
                ]}
                body={categories[config.key]}
                bodyKeys={['name']}
                onEdit={handleEdit}
                onDelete={(item) =>
                  handleDelete({ _id: item, name: item }, config.url)
                }
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Labels;
