import axios from '@/services/axios';
import { Item } from '../types';

export const fetchData = async (url: string): Promise<Item[]> => {
  try {
    const response = await axios.get<Item[]>(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${url}:`, error);
    return [];
  }
};

export const loadData = async (setCategories: any) => {
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
