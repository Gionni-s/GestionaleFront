export interface Food {
  _id: string;
  name: string;
  foodGroupId: string;
  foodGroup: { name: string };
  userId: string;
}

export interface FoodFormData {
  name: string;
  foodGroupId: string;
  userId: string;
}

export interface FoodGroup {
  _id: string;
  name: string;
}
