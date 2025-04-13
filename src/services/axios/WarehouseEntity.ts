import {
  WarehouseEntity,
  WarehouseEntityFormData,
} from '@/app/warehouseEntities/types';
import axios, { ApiCall } from './index';

class WarehouseEntityEntityApi
  implements ApiCall<WarehouseEntity, WarehouseEntityFormData>
{
  private url = 'warehouse-entities';

  /**
   * Get all warehouseEntityEntities with optional query parameters
   * @param params Query parameters as string
   * @returns Promise with WarehouseEntityEntities array
   */
  async get(params?: string): Promise<WarehouseEntity[]> {
    try {
      const queryString = params ? `?${params}` : '';
      const result = await axios.get<WarehouseEntity[]>(
        `${this.url}${queryString}`
      );
      return result.data;
    } catch (error) {
      console.error('Error fetching warehouseEntities:', error);
      throw error;
    }
  }

  /**
   * Get warehouseEntity by ID with optional parameters
   * @param id WarehouseEntity ID
   * @param params Query parameters as string
   * @returns Promise with warehouseEntity data
   */
  async getById(id: string, params?: string): Promise<WarehouseEntity> {
    try {
      const queryString = params ? `?${params}` : '';
      const result = await axios.get<WarehouseEntity>(
        `${this.url}/${id}${queryString}`
      );
      return result.data;
    } catch (error) {
      console.error(`Error fetching warehouseEntity with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new warehouseEntity
   * @param body WarehouseEntity form data
   * @returns Promise with created warehouseEntity
   */
  async post(body: WarehouseEntityFormData): Promise<WarehouseEntity> {
    try {
      const result = await axios.post<WarehouseEntity>(`${this.url}`, body);
      return result.data;
    } catch (error) {
      console.error('Error creating warehouseEntity:', error);
      throw error;
    }
  }

  /**
   * Update an existing warehouseEntity
   * @param id WarehouseEntity ID
   * @param body WarehouseEntity form data
   * @returns Promise with updated warehouseEntity
   */
  async put(
    id: string,
    body: WarehouseEntityFormData
  ): Promise<WarehouseEntity> {
    try {
      const result = await axios.put<WarehouseEntity>(
        `${this.url}/${id}`,
        body
      );
      return result.data;
    } catch (error) {
      console.error(`Error updating warehouseEntity with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a warehouseEntity
   * @param id WarehouseEntity ID
   * @returns Promise
   */
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${this.url}/${id}`);
    } catch (error) {
      console.error(`Error deleting warehouseEntity with ID ${id}:`, error);
      throw error;
    }
  }
}

const warehouseEntityEntityApi = new WarehouseEntityEntityApi();
export default warehouseEntityEntityApi;
