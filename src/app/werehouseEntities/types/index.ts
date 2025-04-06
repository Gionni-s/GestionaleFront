export interface WarehouseEntitiesType {
  _id: string;
  name: string;
  quantita: number;
  scadenza: string;
  foodGroupId: string;
  foodGroup: { name: string };
  locationId: string;
  location: { name: string };
  warehouseId: string;
  warehouse: { name: string };
  userId: string;
}

export interface FormData {
  name: string;
  foodGroupId: string;
  locationId: string;
  warehouseId: string;
  userId: string;
  quantita: number;
  scadenza: string;
}
