'use client';
import React, { useState, useEffect } from 'react';
import axios from '@/services/axios/index';
import { Button } from '@/components/ui/button';
import Select from '@/components/Select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { PlusCircle, Pencil, Trash } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Table from '@/components/Table';

// Define types for data
interface WerehouseEntitie {
  _id: string;
  quantita: number;
  scadenza: string;
  foodId: string;
  food: { name: string };
  locationId: string;
  location: { name: string };
  warehouseId: string;
  warehouse: { name: string };
  userId: string;
}

interface AlthernativeWarehouse {
  message: string;
}

interface FormData {
  foodId: string;
  locationId: string;
  warehouseId: string;
  userId: string;
  quantita: number;
  scadenza: string;
}

const WerehouseEntities: React.FC = () => {
  const [werehouseEntities, setWerehouseEntities] = useState<
    WerehouseEntitie[]
  >([]);
  const [form, setForm] = useState<FormData>({
    foodId: '',
    locationId: '',
    warehouseId: '',
    userId: '',
    quantita: 1,
    scadenza: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [foods, setFoods] = useState<{ _id: string; name: string }[]>([]);
  const [locations, setLocations] = useState<{ _id: string; name: string }[]>(
    []
  );
  const [warehouses, setWarehouses] = useState<{ _id: string; name: string }[]>(
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchWerehouseEntities(),
          fetchFoods(),
          fetchLocations(),
          fetchWarehouses(),
        ]);
      } catch (err) {
        setError('Failed to fetch initial data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchWerehouseEntities = async (): Promise<void> => {
    try {
      const response = await axios.get<WerehouseEntitie[]>(
        '/werehouseEntities?sort=scadenza'
      );
      setWerehouseEntities(response.data || []);
    } catch (err) {
      // setError('Failed to fetch warehouse entities.');
      console.error(err);
    }
  };

  const fetchFoods = async () => {
    try {
      const response = await axios.get('/foods');
      setFoods(response.data || []);
    } catch (error) {
      console.error('Failed to fetch foods:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await axios.get('/locations');
      setLocations(response.data || []);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await axios.get('/warehouses');
      setWarehouses(response.data || []);
    } catch (error) {
      console.error('Failed to fetch warehouses:', error);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();

    const submissionForm = { ...form };

    try {
      if (editingId) {
        await axios.put(`/werehouseEntities/${editingId}`, submissionForm);
      } else {
        await axios.post('/werehouseEntities', submissionForm);
      }
      setModalVisible(false);
      resetForm();
      setEditingId(null);
      await fetchWerehouseEntities();
    } catch (error) {
      console.error('Failed to save warehouse entity:', error);
      setError('Failed to save warehouse entity');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await axios.delete(`/werehouseEntities/${id}`);
      await fetchWerehouseEntities();
    } catch (error) {
      console.error('Failed to delete warehouse entity:', error);
      setError('Failed to delete warehouse entity');
    }
  };

  const resetForm = () => {
    setForm({
      foodId: '',
      locationId: '',
      warehouseId: '',
      userId: '',
      quantita: 1,
      scadenza: '',
    });
  };

  const handleEdit = (werehouseEntitie: WerehouseEntitie) => {
    setForm({
      foodId: werehouseEntitie.foodId,
      locationId: werehouseEntitie.locationId,
      warehouseId: werehouseEntitie.warehouseId,
      userId: werehouseEntitie.userId,
      quantita: werehouseEntitie.quantita,
      scadenza: werehouseEntitie.scadenza.split('T')[0],
    });
    setEditingId(werehouseEntitie._id);
    setModalVisible(true);
  };

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const formGenerator = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Warehouse Entity Management</h1>
        <Dialog open={modalVisible} onOpenChange={setModalVisible}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                resetForm();
                setEditingId(null);
                setModalVisible(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Warehouse Entity
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingId ? 'Edit Warehouse Entity' : 'Add Warehouse Entity'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="food">Food</Label>
                <Select
                  label="Seleziona un cibo"
                  body={foods}
                  form={form}
                  setForm={setForm}
                  fieldToMap="foodId"
                  useCombobox={true}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Select
                  label="Seleziona un Luogo"
                  base={locations.length == 1 ? locations[0] : ''}
                  body={locations}
                  form={form}
                  setForm={setForm}
                  fieldToMap="locationId"
                  useCombobox={true}
                />
              </div>
              <div>
                <Label htmlFor="warehouse">Warehouse</Label>
                <Select
                  label="Seleziona una Warehouse"
                  base={warehouses.length == 1 ? warehouses[0] : ''}
                  body={warehouses}
                  form={form}
                  setForm={setForm}
                  fieldToMap="warehouseId"
                  useCombobox={true}
                />
              </div>
              <div>
                <Label htmlFor="quantita">Quantity</Label>
                <Input
                  id="quantita"
                  type="number"
                  value={form.quantita}
                  onChange={(e) =>
                    setForm({ ...form, quantita: +e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="scadenza">Expiration Date</Label>
                <Input
                  id="scadenza"
                  type="date"
                  value={form.scadenza}
                  onChange={(e) =>
                    setForm({ ...form, scadenza: e.target.value })
                  }
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {editingId ? 'Update' : 'Create'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <div className="w-full mx-auto">
      {formGenerator()}
      <div className="border rounded-lg overflow-hidden">
        <Table
          head={[
            'Food',
            'Quantity',
            'Location',
            'Warehouse',
            'Expiration Date',
            'Actions',
          ]}
          body={werehouseEntities}
          bodyKeys={[
            'food.name',
            'quantita',
            'location.name',
            'warehouse.name',
            'scadenza',
          ]}
          onEdit={handleEdit}
          onDelete={handleDelete}
          columnConfig={{
            scadenza: {
              format: (value) => formatExpiration(value),
              className: (value) => getExpirationColor(value),
            },
          }}
        />
      </div>
    </div>
  );
};

const getExpirationColor = (expirationDate: string) => {
  const daysUntilExpiration =
    (new Date(expirationDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysUntilExpiration <= 0) return 'text-red-600';
  if (daysUntilExpiration <= 7) return 'text-red-500';
  if (daysUntilExpiration <= 30) return 'text-orange-400';
  return 'text-gray-700';
};

function formatExpiration(scadenza?: string) {
  console.log(scadenza);
  if (!scadenza) return 'N/A';
  const date = new Date(scadenza);
  return date < new Date()
    ? `Scaduto (${date.toLocaleDateString()})`
    : date.toLocaleDateString();
}

export default WerehouseEntities;
