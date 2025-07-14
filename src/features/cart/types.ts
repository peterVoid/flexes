export type Cart = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  productId: string;
  quantity: number;
  product: {
    name: string;
    id: string;
    imageUrl: string | null;
    price: number;
  };
};
