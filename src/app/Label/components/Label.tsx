'use client';

import { useEffect, useState } from 'react';
import { fetchData } from '../utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogTrigger,
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

const Labels: React.FC = () => {
  const [foods, setFoods] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Item[]>([]);
  const [warehouses, setWarehouses] = useState<Item[]>([]);
  const [cookbook, setCookbook] = useState<Item[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [editingId, setEditingId] = useState('');
  const [urlNow, setUrlNow] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchData('/foods', setFoods);
        await fetchData('/locations', setLocations);
        await fetchData('/warehouses', setWarehouses);
        await fetchData('/cookBooks', setCookbook);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  async function addItem() {
    try {
      setIsModalOpen(false);
      const item = { name: newItemName, userId: editingId };

      let updatedData;
      if (editingId) {
        // Modifica l'elemento esistente
        await axios.put(`${currentUrl}/${editingId}`, item);
        updatedData = (prevData: Item[]) =>
          prevData.map((el) =>
            el._id === editingId ? { ...el, name: newItemName } : el
          );
      } else {
        // Crea un nuovo elemento
        const response = await axios.post(currentUrl, item);
        updatedData = (prevData: Item[]) => [...prevData, response.data];
      }

      // Aggiorna lo stato corrispondente alla categoria
      updateState(currentUrl, updatedData);

      setNewItemName('');
      setEditingId('');
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
    }
  }

  async function deleteItem(item: Item, url: string) {
    try {
      await axios.delete(`${url}/${item._id}`);

      // Aggiorna lo stato corrispondente rimuovendo l'elemento
      updateState(url, (prevData: Item[]) =>
        prevData.filter((el) => el._id !== item._id)
      );
    } catch (error) {
      console.error("Errore durante l'eliminazione:", error);
    }
  }

  function updateState(url: string, updateFn: (prevData: Item[]) => Item[]) {
    switch (url) {
      case '/foods':
        setFoods(updateFn);
        break;
      case '/locations':
        setLocations(updateFn);
        break;
      case '/warehouses':
        setWarehouses(updateFn);
        break;
      case '/cookBooks':
        setCookbook(updateFn);
        break;
      default:
        console.error('URL non riconosciuto:', url);
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
      {[
        { title: 'Foods', data: foods, url: '/foods' },
        { title: 'Locations', data: locations, url: '/locations' },
        { title: 'Warehouses', data: warehouses, url: '/warehouses' },
        { title: 'Cookbook', data: cookbook, url: '/cookBooks' },
      ].map(({ title, data, url }, index) => (
        <Card
          key={index}
          className="bg-white shadow-lg rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl border border-gray-200"
        >
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-4 px-6 flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            <Button
              variant="ghost"
              className="text-white hover:text-gray-300"
              onClick={() => {
                setCurrentUrl(url);
                setIsModalOpen(true);
              }}
            >
              <PlusCircle className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            <ul className="space-y-2">
              {data.length > 0 ? (
                data.map((element, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center bg-gray-100 p-2 rounded-lg"
                  >
                    <span className="text-gray-800 text-base font-medium">
                      {element.name}
                    </span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setIsModalOpen(true);
                          setUrlNow(url);
                          setEditingId(element._id);
                          setNewItemName(element.name);
                        }}
                        // disabled
                      >
                        <Pencil className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => deleteItem(element, url)}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="p-6 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {editingId ? 'Update Item' : 'Add New Item'}
            </DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Enter name"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="mt-4 p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
          />
          <DialogFooter className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addItem} disabled={!newItemName.trim()}>
              {editingId ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Labels;
