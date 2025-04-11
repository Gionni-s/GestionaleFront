import { ShoppingList, ShoppingListFormData } from '@/app/ShippingList/types';
import axios from './index';

class ShoppingListApi {
  private url = 'shopping-lists';

  /**
   * Get all ShoppingLists with optional query parameters
   * @param params Query parameters as string
   * @returns Promise with ShoppingLists array
   */
  async getShoppingLists(params?: string): Promise<ShoppingList[]> {
    try {
      const queryString = params ? `?${params}` : '';
      const result = await axios.get<ShoppingList[]>(
        `${this.url}${queryString}`
      );
      return result.data;
    } catch (error) {
      console.error('Error fetching ShoppingLists:', error);
      throw error;
    }
  }

  /**
   * Get ShoppingList by ID with optional parameters
   * @param id ShoppingList ID
   * @param params Query parameters as string
   * @returns Promise with ShoppingList data
   */
  async getShoppingListById(
    id: string,
    params?: string
  ): Promise<ShoppingList> {
    try {
      const queryString = params ? `?${params}` : '';
      const result = await axios.get<ShoppingList>(
        `${this.url}/${id}${queryString}`
      );
      return result.data;
    } catch (error) {
      console.error(`Error fetching ShoppingList with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new ShoppingList
   * @param body ShoppingList form data
   * @returns Promise with created ShoppingList
   */
  async createShoppingList(body: ShoppingListFormData): Promise<ShoppingList> {
    try {
      const result = await axios.post<ShoppingList>(`${this.url}`, body);
      return result.data;
    } catch (error) {
      console.error('Error creating ShoppingList:', error);
      throw error;
    }
  }

  /**
   * Update an existing ShoppingList
   * @param id ShoppingList ID
   * @param body ShoppingList form data
   * @returns Promise with updated ShoppingList
   */
  async updateShoppingList(
    id: string,
    body: ShoppingListFormData
  ): Promise<ShoppingList> {
    try {
      const result = await axios.put<ShoppingList>(`${this.url}/${id}`, body);
      return result.data;
    } catch (error) {
      console.error(`Error updating ShoppingList with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a ShoppingList
   * @param id ShoppingList ID
   * @returns Promise
   */
  async deleteShoppingList(id: string): Promise<void> {
    try {
      await axios.delete(`${this.url}/${id}`);
    } catch (error) {
      console.error(`Error deleting ShoppingList with ID ${id}:`, error);
      throw error;
    }
  }
}

const shoppingListApi = new ShoppingListApi();
export default shoppingListApi;
