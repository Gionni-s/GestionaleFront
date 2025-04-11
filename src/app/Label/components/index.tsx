'use client';

import { useEffect, useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import Table from '@/components/Table';
import Modal from '@/components/Modal';
import FoodGroupApi from '@/services/axios/FoodGroup';
import LocationApi from '@/services/axios/Location';
import WarehouseApi from '@/services/axios/Warehouse';
import CookbookApi from '@/services/axios/Cookbook';
import {
  FoodGroup,
  Location,
  Warehouse,
  Cookbook,
  FoodGroupFormData,
  LocationFormData,
  WarehouseFormData,
  CookbookFormData,
} from '@/app/Label/types';

type CategoryKey = 'foodGroups' | 'locations' | 'warehouses' | 'cookbook';
type Categories = Record<
  CategoryKey,
  (FoodGroup | Location | Warehouse | Cookbook)[]
>;

interface CategoryConfig {
  title: string;
  key: CategoryKey;
  api: any;
}

const Labels = () => {
  const { t } = useTranslation();
  const { toast } = useToast();

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
    editingId: '',
    isEdit: false,
  });

  // Category configuration maps
  const categoryConfigs: CategoryConfig[] = [
    {
      title: t('foodGroups'),
      key: 'foodGroups',
      api: FoodGroupApi,
    },
    {
      title: t('locations'),
      key: 'locations',
      api: LocationApi,
    },
    {
      title: t('warehouses'),
      key: 'warehouses',
      api: WarehouseApi,
    },
    {
      title: t('cookBooks'),
      key: 'cookbook',
      api: CookbookApi,
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const promises = categoryConfigs.map(async (config) => {
        let data;
        switch (config.key) {
          case 'foodGroups':
            data = await FoodGroupApi.getFoodGroups();
            break;
          case 'locations':
            data = await LocationApi.getLocations();
            break;
          case 'warehouses':
            data = await WarehouseApi.getWarehouses();
            break;
          case 'cookbook':
            data = await CookbookApi.getCookbooks();
            break;
        }
        return { key: config.key, data };
      });

      const results = await Promise.all(promises);
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

  const handleModalOpen = (
    category: CategoryKey,
    item?: FoodGroup | Location | Warehouse | Cookbook
  ) => {
    setModalState({
      itemName: item?.name || '',
      currentCategory: category,
      editingId: item?._id || '',
      isEdit: !!item,
    });
  };

  const handleModalClose = () => {
    setModalState({
      itemName: '',
      currentCategory: '' as CategoryKey,
      editingId: '',
      isEdit: false,
    });
  };

  const handleSave = async () => {
    const { itemName, currentCategory, editingId } = modalState;

    if (!itemName.trim()) return;

    setActionLoading(true);
    try {
      let updatedItem;
      const formData = {
        _id: editingId,
        name: itemName,
      };

      if (editingId) {
        // Update existing item using the appropriate API
        switch (currentCategory) {
          case 'foodGroups':
            updatedItem = await FoodGroupApi.updateFoodGroup(
              editingId,
              formData as FoodGroupFormData
            );
            break;
          case 'locations':
            updatedItem = await LocationApi.updateLocation(
              editingId,
              formData as LocationFormData
            );
            break;
          case 'warehouses':
            updatedItem = await WarehouseApi.updateWarehouse(
              editingId,
              formData as WarehouseFormData
            );
            break;
          case 'cookbook':
            updatedItem = await CookbookApi.updateCookbook(
              editingId,
              formData as CookbookFormData
            );
            break;
          default:
            throw new Error('Invalid category');
        }

        toast({
          title: 'Success',
          description: 'Item updated successfully',
        });
      } else {
        // Create new item using the appropriate API
        switch (currentCategory) {
          case 'foodGroups':
            updatedItem = await FoodGroupApi.createFoodGroup({
              name: itemName,
            } as FoodGroupFormData);
            break;
          case 'locations':
            updatedItem = await LocationApi.createLocation({
              name: itemName,
            } as LocationFormData);
            break;
          case 'warehouses':
            updatedItem = await WarehouseApi.createWarehouse({
              name: itemName,
            } as WarehouseFormData);
            break;
          case 'cookbook':
            updatedItem = await CookbookApi.createCookbook({
              name: itemName,
            } as CookbookFormData);
            break;
          default:
            throw new Error('Invalid category');
        }

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

  const handleDelete = async (
    item: FoodGroup | Location | Warehouse | Cookbook | string
  ) => {
    const id = typeof item === 'string' ? item : item._id;

    try {
      setActionLoading(true);

      // Delete item using the appropriate API
      switch (activeTab) {
        case 'foodGroups':
          await FoodGroupApi.deleteFoodGroup(id);
          break;
        case 'locations':
          await LocationApi.deleteLocation(id);
          break;
        case 'warehouses':
          await WarehouseApi.deleteWarehouse(id);
          break;
        case 'cookbook':
          await CookbookApi.deleteCookbook(id);
          break;
        default:
          throw new Error('Invalid category');
      }

      setCategories((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].filter((el) => el._id !== id),
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

  const handleEdit = (item: FoodGroup | Location | Warehouse | Cookbook) => {
    handleModalOpen(activeTab, item);
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
                  handleModalOpen(config.key);
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
                onDelete={handleDelete}
              />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Labels;
