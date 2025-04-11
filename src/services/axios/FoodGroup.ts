import axios from './index';
import { FoodGroup, FoodGroupFormData } from '@/app/Label/types';

class FoodGroupApi {
  private url = 'food-groups';

  /**
   * Get all food groups with optional query parameters
   * @param params Query parameters as string
   * @returns Promise with Food Groups array
   */
  async getFoodGroups(params?: string): Promise<FoodGroup[]> {
    try {
      const queryString = params ? `?${params}` : '';
      const result = await axios.get<FoodGroup[]>(`${this.url}${queryString}`);
      return result.data;
    } catch (error) {
      console.error('Error fetching food groups:', error);
      throw error;
    }
  }

  /**
   * Get food by ID with optional parameters
   * @param id Food Group ID
   * @param params Query parameters as string
   * @returns Promise with food data
   */
  async getFoodGroupById(id: string, params?: string): Promise<FoodGroup> {
    try {
      const queryString = params ? `?${params}` : '';
      const result = await axios.get<FoodGroup>(
        `${this.url}/${id}${queryString}`
      );
      return result.data;
    } catch (error) {
      console.error(`Error fetching food with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new food
   * @param body Food Group form data
   * @returns Promise with created food group
   */
  async createFoodGroup(body: FoodGroupFormData): Promise<FoodGroup> {
    try {
      const result = await axios.post<FoodGroup>(`${this.url}`, body);
      return result.data;
    } catch (error) {
      console.error('Error creating food:', error);
      throw error;
    }
  }

  /**
   * Update an existing food
   * @param id Food Group ID
   * @param body Food Group form data
   * @returns Promise with updated food
   */
  async updateFoodGroup(
    id: string,
    body: FoodGroupFormData
  ): Promise<FoodGroup> {
    try {
      const result = await axios.put<FoodGroup>(`${this.url}/${id}`, body);
      return result.data;
    } catch (error) {
      console.error(`Error updating food with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a food
   * @param id Food Group ID
   * @returns Promise
   */
  async deleteFoodGroup(id: string): Promise<void> {
    try {
      await axios.delete(`${this.url}/${id}`);
    } catch (error) {
      console.error(`Error deleting food with ID ${id}:`, error);
      throw error;
    }
  }
}

const foodGroupApi = new FoodGroupApi();
export default foodGroupApi;
