import { Warehouse, WarehouseFormData } from '@/app/Label/types';
import axios, { ApiCall } from './index';

class WarehouseApi implements ApiCall<Warehouse, WarehouseFormData> {
  private url = 'warehouses';

  /**
   * Get all warehouses with optional query parameters
   * @param params Query parameters as string
   * @returns Promise with Warehouses array
   */
  async get(params?: string): Promise<Warehouse[]> {
    try {
      const queryString = params ? `?${params}` : '';
      const result = await axios.get<Warehouse[]>(`${this.url}${queryString}`);
      return result.data;
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      throw error;
    }
  }

  /**
   * Get warehouse by ID with optional parameters
   * @param id Warehouse ID
   * @param params Query parameters as string
   * @returns Promise with warehouse data
   */
  async getById(id: string, params?: string): Promise<Warehouse> {
    try {
      const queryString = params ? `?${params}` : '';
      const result = await axios.get<Warehouse>(
        `${this.url}/${id}${queryString}`
      );
      return result.data;
    } catch (error) {
      console.error(`Error fetching warehouse with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new warehouse
   * @param body Warehouse form data
   * @returns Promise with created warehouse
   */
  async post(body: WarehouseFormData): Promise<Warehouse> {
    try {
      const result = await axios.post<Warehouse>(`${this.url}`, body);
      return result.data;
    } catch (error) {
      console.error('Error creating warehouse:', error);
      throw error;
    }
  }

  /**
   * Update an existing warehouse
   * @param id Warehouse ID
   * @param body Warehouse form data
   * @returns Promise with updated warehouse
   */
  async put(id: string, body: WarehouseFormData): Promise<Warehouse> {
    try {
      const result = await axios.put<Warehouse>(`${this.url}/${id}`, body);
      return result.data;
    } catch (error) {
      console.error(`Error updating warehouse with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a warehouse
   * @param id Warehouse ID
   * @returns Promise
   */
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${this.url}/${id}`);
    } catch (error) {
      console.error(`Error deleting warehouse with ID ${id}:`, error);
      throw error;
    }
  }
}

const warehouseApi = new WarehouseApi();
export default warehouseApi;
