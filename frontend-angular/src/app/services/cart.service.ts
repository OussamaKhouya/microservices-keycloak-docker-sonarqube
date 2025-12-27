import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product.model';

export interface CartItem {
    product: Product;
    quantity: number;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    items = signal<CartItem[]>([]);

    totalItems = computed(() => this.items().reduce((acc, item) => acc + item.quantity, 0));
    totalPrice = computed(() => this.items().reduce((acc, item) => acc + (item.product.price * item.quantity), 0));

    addToCart(product: Product, quantity: number) {
        this.items.update(curr => {
            const existing = curr.find(i => i.product.id === product.id);
            if (existing) {
                return curr.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
            }
            return [...curr, { product, quantity }];
        });
    }

    removeFromCart(productId: number) {
        this.items.update(curr => curr.filter(i => i.product.id !== productId));
    }

    clearCart() {
        this.items.set([]);
    }
}
