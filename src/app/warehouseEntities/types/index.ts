export interface WarehouseEntity {
  _id: string;
  name: string;
  quantity: number;
  expirationDate: string;
  foodId: string;
  food: { name: string };
  locationId: string;
  location: { name: string };
  warehouseId: string;
  warehouse: { name: string };
  userId: string;
}

export interface WarehouseEntityFormData {
  name: string;
  foodId: string;
  locationId: string;
  warehouseId: string;
  userId: string;
  quantity: number;
  expirationDate: string;
}
