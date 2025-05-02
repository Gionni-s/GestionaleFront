import { Food } from '@/app/food/types';
import { Cookbook } from '@/app/label/types';

export interface Recipe {
  _id: string;
  name: string;
  userId: string;
  ingredients: RecipeIngredient[];
  cookbookId: string;
  cookBook: Cookbook;
  food: Food[];
  note?: string;
}

export interface Ingredient {
  _id: string;
  name: string;
}

export interface RecipeIngredient {
  foodId: string;
  name: string;
  quantity: number;
  food?: { _id: string; name: string };
}

export interface IngredientFormData {
  name: string;
  cookbookId: string;
  ingredients: RecipeIngredient[];
  note?: string;
}
