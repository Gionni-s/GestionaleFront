export interface Recipe {
  _id: string;
  name: string;
  userId: string;
  ingridients: RecipeIngridient[];
  cookbookId: string;
  cookBook: CookBook;
  food: Ingridient;
  note?: string;
}

export interface AlternativeRecipe {
  message: string;
}

export interface Ingridient {
  _id: string;
  name: string;
}

export interface CookBook {
  _id: string;
  name: string;
}

export interface RecipeIngridient {
  foodId: string;
  name: string;
  quantity: number;
  food?: { _id: string; name: string };
}

export interface FormData {
  name: string;
  cookbookId: string;
  ingridients: RecipeIngridient[];
  note?: string;
}
