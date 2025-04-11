export interface Item {
  _id: string;
  userId: string;
  name: string;
}

export interface FoodGroup {
  _id: string;
  name: string;
}
export interface Location {
  _id: string;
  name: string;
}
export interface Warehouse {
  _id: string;
  name: string;
}
export interface Cookbook {
  _id: string;
  name: string;
}

export type FoodGroupFormData = {
  _id: string;
  name: string;
};
export type LocationFormData = {
  _id: string;
  name: string;
};
export type WarehouseFormData = {
  _id: string;
  name: string;
};
export type CookbookFormData = {
  _id: string;
  name: string;
};
