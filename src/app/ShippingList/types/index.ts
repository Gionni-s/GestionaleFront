export interface ShoppingList {
  _id: string;
  foodId: string;
  quantity: number;
  status: string;
}

export interface ShoppingListFormData {
  foodId: string;
  quantity: number;
}
