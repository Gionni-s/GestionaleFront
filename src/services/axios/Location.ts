import { Location, LocationFormData } from '@/app/Label/types';
import axios, { ApiCall } from './index';

class LocationApi implements ApiCall<Location, LocationFormData> {
  private url = 'locations';

  /**
   * Get all locations with optional query parameters
   * @param params Query parameters as string
   * @returns Promise with Locations array
   */
  async get(params?: string): Promise<Location[]> {
    try {
      const queryString = params ? `?${params}` : '';
      const result = await axios.get<Location[]>(`${this.url}${queryString}`);
      return result.data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }

  /**
   * Get location by ID with optional parameters
   * @param id Location ID
   * @param params Query parameters as string
   * @returns Promise with location data
   */
  async getById(id: string, params?: string): Promise<Location> {
    try {
      const queryString = params ? `?${params}` : '';
      const result = await axios.get<Location>(
        `${this.url}/${id}${queryString}`
      );
      return result.data;
    } catch (error) {
      console.error(`Error fetching location with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new location
   * @param body Location form data
   * @returns Promise with created location
   */
  async post(body: LocationFormData): Promise<Location> {
    try {
      const result = await axios.post<Location>(`${this.url}`, body);
      return result.data;
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  }

  /**
   * Update an existing location
   * @param id Location ID
   * @param body Location form data
   * @returns Promise with updated location
   */
  async put(id: string, body: LocationFormData): Promise<Location> {
    try {
      const result = await axios.put<Location>(`${this.url}/${id}`, body);
      return result.data;
    } catch (error) {
      console.error(`Error updating location with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a location
   * @param id Location ID
   * @returns Promise
   */
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${this.url}/${id}`);
    } catch (error) {
      console.error(`Error deleting location with ID ${id}:`, error);
      throw error;
    }
  }
}

const locationApi = new LocationApi();
export default locationApi;
