import { Product } from './product.model';

export interface OrderItem {
    id: number;
    productId: number;
    quantity: number;
    price?: number;     // Correspond au backend
    unitPrice?: number; // Alias ancien si nécessaire, mais on préfère price
    product?: Product;
}

export interface Order {
    id?: number;
    orderDate?: string;
    status?: string;
    totalAmount?: number;
    orderItems: OrderItem[];
}
