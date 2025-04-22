import { Food } from "@/app/Food/types";

export interface ShoppingList {
  _id: string;
  foodId: string;
  food: Food;
  quantity: number;
  status: string;
}

export interface ShoppingListFormData {
  foodId: string;
  quantity: number;
  status?: string;
}
