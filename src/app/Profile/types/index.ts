import { Food } from '@/app/Food/types';

export interface User {
  _id: string;
  name: string;
  surname: string;
  email: string;
  isConfimer: boolean;
  password: string;
  phoneNumber: number;
  dateCreation: Date;
  lastLogin: Date;
  profileImage: { file: string; type: string } | undefined;
  color: string;
  role: string;
}

export interface MinStockLevel {
  _id: string;
  foodId: string;
  food: Food;
  quantity: number;
}

export interface RootState {
  settings: {
    darkMode: boolean;
  };
}
