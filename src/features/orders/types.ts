import { OrderStatus } from "@/db/schema";

export type Order = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  productId: string;
  quantity: number;
  order_id: string;
  user_id: string;
  gross_amount: number;
  courier: string;
  hasPaid: boolean;
  payment_type: string | null;
  shippingAmount: number;
  status: OrderStatus;
  product: {
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    reviews: {
      id: string;
      rating: number;
      description: string | null;
    }[];
  };
  address: {
    complete_address: string;
  };
};
