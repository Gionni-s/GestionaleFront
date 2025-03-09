export interface Item {
  _id: string;
  userId: string;
  name: string;
}

export type Category = {
  title: string;
  data: Item[];
  url: string;
};
