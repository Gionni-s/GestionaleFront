import { axiosInstance as axios } from '@/services/axios';

export const fetchData = async (url: string, setFood: Function) => {
  try {
    const response = await axios.get(url);
    setFood(response.data);
  } catch (error) {
    console.error('Errore nel recupero dei dati:', error);
  }
};
