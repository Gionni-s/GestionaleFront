'use client';
import React, { useState, useEffect } from 'react';
import axios from '@/services/axios/index';
import Select from '@/components/Select';
import { Label } from '@/components/ui/label';
import { PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Table from '@/components/Table';
import { useTranslation } from 'react-i18next';
import { FormData, WarehouseEntitiesType } from '../types';
import Modal from '@/components/Modal';

const WarehouseEntities: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [warehouseEntities, setWarehouseEntities] = useState<
    WarehouseEntitiesType[]
  >([]);
  const [form, setForm] = useState<FormData>({
    name: '',
    foodGroupId: '',
    locationId: '',
    warehouseId: '',
    userId: '',
    quantita: 1,
    scadenza: '',
  });
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [foodGroups, setFoodGroups] = useState<{ _id: string; name: string }[]>(
    []
  );
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
          fetchWarehouseEntities(),
          fetchFoodGroups(),
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

  const fetchWarehouseEntities = async (): Promise<void> => {
    try {
      const response = await axios.get<WarehouseEntitiesType[]>(
        '/werehouseEntities?sort=scadenza'
      );
      setWarehouseEntities(response.data || []);
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

  const handleSubmit = async (): Promise<void> => {
    const submissionForm = { ...form };

    try {
      if (editingId) {
        await axios.put(`/werehouseEntities/${editingId}`, submissionForm);
      } else {
        await axios.post('/werehouseEntities', submissionForm);
      }
      resetForm();
      setEditingId(undefined);
      await fetchWarehouseEntities();
    } catch (error) {
      console.error('Failed to save warehouse entity:', error);
      setError('Failed to save warehouse entity');
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await axios.delete(`/werehouseEntities/${id}`);
      await fetchWarehouseEntities();
    } catch (error) {
      console.error('Failed to delete warehouse entity:', error);
      setError('Failed to delete warehouse entity');
    }
  };

  const resetForm = () => {
    setForm({
      name: '',
      foodGroupId: '',
      locationId: '',
      warehouseId: '',
      userId: '',
      quantita: 1,
      scadenza: '',
    });
  };

  const handleEdit = (warehouseEntities: WarehouseEntitiesType) => {
    setForm({
      name: warehouseEntities.name,
      foodGroupId: warehouseEntities.foodGroupId,
      locationId: warehouseEntities.locationId,
      warehouseId: warehouseEntities.warehouseId,
      userId: warehouseEntities.userId,
      quantita: warehouseEntities.quantita,
      scadenza: warehouseEntities.scadenza.split('T')[0],
    });
    setEditingId(warehouseEntities._id);
  };

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const formGenerator = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {t('warehouseEntityManagements')}
        </h1>
        <Modal
          onCancel={() => {
            resetForm();
            setEditingId(undefined);
          }}
          onSave={handleSubmit}
          title={editingId ? t('editFoods') : t('addFoods')}
          triggerText={t('addFoods')}
          isEdit={editingId}
          icon={<PlusCircle className="mr-2 h-4 w-4" />}
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
                label={t('foodGroupSelectLabel')}
                body={foodGroups}
                form={form}
                setForm={setForm}
                fieldToMap="foodGroupId"
                useCombobox={true}
              />
            </div>
            <div>
              <Label htmlFor="location">{t('locations')}</Label>
              <Select
                label={t('locationSelectLabel')}
                base={locations.length == 1 ? locations[0] : ''}
                body={locations}
                form={form}
                setForm={setForm}
                fieldToMap="locationId"
                useCombobox={true}
              />
            </div>
            <div>
              <Label htmlFor="warehouse">{t('warehouses')}</Label>
              <Select
                label={t('warehouseSelectLabel')}
                base={warehouses.length == 1 ? warehouses[0] : ''}
                body={warehouses}
                form={form}
                setForm={setForm}
                fieldToMap="warehouseId"
                useCombobox={true}
              />
            </div>
            <div>
              <Label htmlFor="quantita">{t('quantities')}</Label>
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
              <Label htmlFor="scadenza">{t('expirationDates')}</Label>
              <Input
                id="scadenza"
                type="date"
                value={form.scadenza}
                onChange={(e) => setForm({ ...form, scadenza: e.target.value })}
                required
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
            t('quantities'),
            t('locations'),
            t('warehouses'),
            t('expirationDates'),
            { label: t('actions'), className: 'w-[100px]' },
          ]}
          body={warehouseEntities}
          bodyKeys={[
            'name',
            'foodGroup.name',
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
  if (!scadenza) return 'N/A';
  const date = new Date(scadenza);
  return date < new Date()
    ? `Scaduto (${date.toLocaleDateString()})`
    : date.toLocaleDateString();
}

export default WarehouseEntities;
