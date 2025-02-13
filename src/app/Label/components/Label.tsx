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
} from '@/components/ui/dialog';
import { axiosInstance as axios } from '@/services/axios';
import { PlusCircle, Pencil, Trash } from 'lucide-react';

interface Item {
  _id: string;
  userId: string;
  name: string;
}

type Category = {
  title: string;
  data: Item[];
  url: string;
};

const fetchData = async (url: string): Promise<Item[]> => {
  try {
    const response = await axios.get<Item[]>(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return [];
  }
};

const Labels = () => {
  // Initialize categories with empty arrays
  const [categories, setCategories] = useState<Record<string, Item[]>>({
    foods: [],
    locations: [],
    warehouses: [],
    cookbook: [],
  });

  const [modalState, setModalState] = useState({
    isOpen: false,
    itemName: '',
    currentUrl: '',
    editingId: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [foods, locations, warehouses, cookbook] = await Promise.all([
          fetchData('/foods'),
          fetchData('/locations'),
          fetchData('/warehouses'),
          fetchData('/cookBooks'),
        ]);

        setCategories({
          foods,
          locations,
          warehouses,
          cookbook,
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const handleModalOpen = (url: string, item?: Item) => {
    setModalState({
      isOpen: true,
      itemName: item?.name || '',
      currentUrl: url,
      editingId: item?._id || '',
    });
  };

  const handleModalClose = () => {
    setModalState({
      isOpen: false,
      itemName: '',
      currentUrl: '',
      editingId: '',
    });
  };

  const handleSave = async () => {
    try {
      const { itemName, currentUrl, editingId } = modalState;

      let updatedItem: Item;
      if (editingId) {
        const response = await axios.put(`${currentUrl}/${editingId}`, {
          name: itemName,
        });
        updatedItem = response.data;
      } else {
        const response = await axios.post(currentUrl, {
          name: itemName,
          userId: 'default-user-id', // Sostituisci con l'ID utente effettivo
        });
        updatedItem = response.data;
      }

      const categoryKey = currentUrl
        .replace('/', '')
        .replace('Books', 'book') as keyof typeof categories;

      setCategories((prev) => {
        // Assicuriamoci che l'array esista e sia valido
        const currentArray = Array.isArray(prev[categoryKey])
          ? prev[categoryKey]
          : [];

        return {
          ...prev,
          [categoryKey]: editingId
            ? currentArray.map((item) =>
                item._id === editingId
                  ? { ...item, name: updatedItem.name }
                  : item
              )
            : [...currentArray, updatedItem],
        };
      });

      handleModalClose();
    } catch (error) {
      console.error('Error saving item:', error);
    }
  };

  // Aggiorniamo anche handleDelete per sicurezza
  const handleDelete = async (item: Item, url: string) => {
    try {
      await axios.delete(`${url}/${item._id}`);
      const categoryKey = url
        .replace('/', '')
        .replace('Books', 'book') as keyof typeof categories;

      setCategories((prev) => {
        const currentArray = Array.isArray(prev[categoryKey])
          ? prev[categoryKey]
          : [];
        return {
          ...prev,
          [categoryKey]: currentArray.filter((el) => el._id !== item._id),
        };
      });
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const categoryConfigs: Category[] = [
    { title: 'Foods', data: categories.foods || [], url: '/foods' },
    { title: 'Locations', data: categories.locations || [], url: '/locations' },
    {
      title: 'Warehouses',
      data: categories.warehouses || [],
      url: '/warehouses',
    },
    { title: 'Cookbook', data: categories.cookbook || [], url: '/cookBooks' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {categoryConfigs.map(({ title, data, url }) => (
        <Card
          key={title}
          className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border border-gray-200"
        >
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 px-6 flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <Button
              variant="ghost"
              className="text-white hover:text-gray-300"
              onClick={() => handleModalOpen(url)}
            >
              <PlusCircle className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="space-y-2">
              {data?.length > 0 ? (
                data.map((element) => (
                  <li
                    key={element._id}
                    className="flex justify-between items-center bg-gray-100 p-2 rounded-lg"
                  >
                    <span className="text-gray-800 text-base font-medium">
                      {element.name}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleModalOpen(url, element)}
                      >
                        <Pencil className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDelete(element, url)}
                      >
                        <Trash className="w-5 h-5" />
                      </Button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="text-gray-500 italic">No items available</li>
              )}
            </ul>
          </CardContent>
        </Card>
      ))}

      <Dialog
        open={modalState.isOpen}
        onOpenChange={(open) => !open && handleModalClose()}
      >
        <DialogContent className="p-6 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {modalState.editingId ? 'Update Item' : 'Add New Item'}
            </DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter name"
            value={modalState.itemName}
            onChange={(e) =>
              setModalState((prev) => ({ ...prev, itemName: e.target.value }))
            }
            className="mt-4 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={handleModalClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!modalState.itemName.trim()}>
              {modalState.editingId ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Labels;
