import { Product } from './product.model';

export interface OrderItem {
    id?: number;
    productId: number;
    quantity: number;
    unitPrice?: number;
    product?: Product;
}

export interface Order {
    id?: number;
    orderDate?: string;
    status?: string;
    totalAmount?: number;
    orderItems?: OrderItem[];
}
