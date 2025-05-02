import { Event, FormEvent } from '@/app/calendar/types';
import axios, { ApiCall } from './index';

class EventApi implements ApiCall<Event, FormEvent> {
  private url = 'events';

  /**
   * Get all events with optional query parameters
   * @param params Query parameters as string
   * @returns Promise with events array
   */
  async get(params?: string): Promise<Event[]> {
    try {
      const queryString = params ? `?${params}` : '';
      const result = await axios.get<Event[]>(`${this.url}${queryString}`);
      return result.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Get event by ID with optional parameters
   * @param id event ID
   * @param params Query parameters as string
   * @returns Promise with event data
   */
  async getById(id: string, params?: string): Promise<Event> {
    try {
      const queryString = params ? `?${params}` : '';
      const result = await axios.get<Event>(`${this.url}/${id}${queryString}`);
      return result.data;
    } catch (error) {
      console.error(`Error fetching event with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Create a new event
   * @param body event form data
   * @returns Promise with created event
   */
  async post(body: FormEvent): Promise<Event> {
    try {
      const result = await axios.post<Event>(`${this.url}`, body);
      return result.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Update an existing event
   * @param id event ID
   * @param body event form data
   * @returns Promise with updated event
   */
  async put(id: string, body: FormEvent): Promise<Event> {
    try {
      const result = await axios.put<Event>(`${this.url}/${id}`, body);
      return result.data;
    } catch (error) {
      console.error(`Error updating event with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Delete a event
   * @param id event ID
   * @returns Promise
   */
  async delete(id: string): Promise<void> {
    try {
      await axios.delete(`${this.url}/${id}`);
    } catch (error) {
      console.error(`Error deleting event with ID ${id}:`, error);
      throw error;
    }
  }
}

const eventApi = new EventApi();
export default eventApi;
