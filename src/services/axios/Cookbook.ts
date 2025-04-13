import { Cookbook, CookbookFormData } from '@/app/Label/types';
import axios from './index';

class CookbookApi {
  private url = 'cookBooks';

  /**
   * Get all cookbooks with optional query parameters
   * @param params Query parameters as string
   * @returns Promise with Cookbooks array
   */
  async getCookbooks(params?: string): Promise<Cookbook[]> {
    try {
      const queryString = params ? `?${params}` : '';
      const result = await axios.get<Cookbook[]>(`${this.url}${queryString}`);
      return result.data;
    } catch (error) {
      console.error('Error fetching cookbooks:', error);
      throw error;
    }
  }

  /**
   * Get cookbook by ID with optional parameters
   * @param id Cookbook ID
   * @param params Query parameters as string
   * @returns Promise with cookbook data
   */
  async getCookbookById(id: string, params?: string): Promise<Cookbook> {
    try {
      const queryString = params ? `?${params}` : '';
      const result = await axios.get<Cookbook>(
        `${this.url}/${id}${queryString}`
      );
      return result.data;
    } catch (error) {
      console.error(`Error fetching cookbook with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new cookbook
   * @param body Cookbook form data
   * @returns Promise with created cookbook
   */
  async createCookbook(body: CookbookFormData): Promise<Cookbook> {
    try {
      const result = await axios.post<Cookbook>(`${this.url}`, body);
      return result.data;
    } catch (error) {
      console.error('Error creating cookbook:', error);
      throw error;
    }
  }

  /**
   * Update an existing cookbook
   * @param id Cookbook ID
   * @param body Cookbook form data
   * @returns Promise with updated cookbook
   */
  async updateCookbook(id: string, body: CookbookFormData): Promise<Cookbook> {
    try {
      const result = await axios.put<Cookbook>(`${this.url}/${id}`, body);
      return result.data;
    } catch (error) {
      console.error(`Error updating cookbook with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a cookbook
   * @param id Cookbook ID
   * @returns Promise
   */
  async deleteCookbook(id: string): Promise<void> {
    try {
      await axios.delete(`${this.url}/${id}`);
    } catch (error) {
      console.error(`Error deleting cookbook with ID ${id}:`, error);
      throw error;
    }
  }
}

const cookbookApi = new CookbookApi();
export default cookbookApi;
