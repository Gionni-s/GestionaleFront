import axios from './index';
import { Food, FoodFormData } from '@/app/Food/types';

class FoodApi {
  private url = 'foods';

  /**
   * Get all foods with optional query parameters
   * @param params Query parameters as string
   * @returns Promise with foods array
   */
  async getFoods(params?: string): Promise<Food[]> {
    try {
      const queryString = params ? `?${params}` : '';
      const result = await axios.get<Food[]>(`${this.url}${queryString}`);
      return result.data;
    } catch (error) {
      console.error('Error fetching foods:', error);
      throw error;
    }
  }

  /**
   * Get food by ID with optional parameters
   * @param id Food ID
   * @param params Query parameters as string
   * @returns Promise with food data
   */
  async getFoodById(id: string, params?: string): Promise<Food> {
    try {
      const queryString = params ? `?${params}` : '';
      const result = await axios.get<Food>(`${this.url}/${id}${queryString}`);
      return result.data;
    } catch (error) {
      console.error(`Error fetching food with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new food
   * @param body Food form data
   * @returns Promise with created food
   */
  async createFood(body: FoodFormData): Promise<Food> {
    try {
      const result = await axios.post<Food>(`${this.url}`, body);
      return result.data;
    } catch (error) {
      console.error('Error creating food:', error);
      throw error;
    }
  }

  /**
   * Update an existing food
   * @param id Food ID
   * @param body Food form data
   * @returns Promise with updated food
   */
  async updateFood(id: string, body: FoodFormData): Promise<Food> {
    try {
      const result = await axios.put<Food>(`${this.url}/${id}`, body);
      return result.data;
    } catch (error) {
      console.error(`Error updating food with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a food
   * @param id Food ID
   * @returns Promise
   */
  async deleteFood(id: string): Promise<void> {
    try {
      await axios.delete(`${this.url}/${id}`);
    } catch (error) {
      console.error(`Error deleting food with ID ${id}:`, error);
      throw error;
    }
  }
}

const foodApi = new FoodApi();
export default foodApi;
