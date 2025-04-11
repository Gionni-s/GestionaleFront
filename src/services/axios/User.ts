import { User } from '@/app/Profile/types';
import axios from './index';
import { UserFormData } from '@/app/Auth/types';

class UserApi {
  private url = 'users';

  /**
   * Get all users with optional query parameters
   * @param params Query parameters as string
   * @returns Promise with users array
   */
  async getUsers(params?: string): Promise<User[]> {
    try {
      const queryString = params ? `?${params}` : '';
      const result = await axios.get<User[]>(`${this.url}${queryString}`);
      return result.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Get user by ID with optional parameters
   * @param id User ID
   * @param params Query parameters as string
   * @returns Promise with user data
   */
  async getUserById(id: string, params?: string): Promise<User> {
    try {
      const queryString = params ? `?${params}` : '';
      const result = await axios.get<User>(`${this.url}/${id}${queryString}`);
      return result.data;
    } catch (error) {
      console.error(`Error fetching user with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new user
   * @param body User form data
   * @returns Promise with created user
   */
  async createUser(body: UserFormData): Promise<User> {
    try {
      const result = await axios.post<User>(`${this.url}`, body);
      return result.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  //uso User perchè non non modificare molti campi che nel UserFormData
  /**
   * Update an existing user
   * @param id User ID
   * @param body User form data
   * @returns Promise with updated user
   */
  async updateUser(id: string, body: User): Promise<User> {
    try {
      const result = await axios.put<User>(`${this.url}/${id}`, body);
      return result.data;
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error);
      throw error;
    }
  }

  //uso User perchè non non modificare molti campi che nel UserFormData
  /**
   * Update an Me
   * @param id User ID
   * @param body User form data
   * @returns Promise with updated user
   */
  async updateMe(body: User): Promise<User> {
    try {
      const result = await axios.put<User>(`${this.url}/me`, body);
      return result.data;
    } catch (error) {
      console.error(`Error updating me:`, error);
      throw error;
    }
  }

  /**
   * Delete a user
   * @param id User ID
   * @returns Promise
   */
  async deleteUser(id: string): Promise<void> {
    try {
      await axios.delete(`${this.url}/${id}`);
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error);
      throw error;
    }
  }
}

const userApi = new UserApi();
export default userApi;
