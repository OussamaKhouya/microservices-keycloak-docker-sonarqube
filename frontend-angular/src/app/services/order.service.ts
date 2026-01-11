import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order } from '../models/order.model';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class OrderService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiGatewayUrl}/order-service/api/orders`;

    getAllOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.apiUrl);
    }

    getOrderById(id: number): Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/${id}`);
    }

    createOrder(items: { productId: number; quantity: number }[]): Observable<Order> {
        const payload = {
            orderItems: items
        };
        // @ts-ignore
        return this.http.post<Order>(this.apiUrl, payload);
    }

    updateOrder(id: number, order: Order): Observable<Order> {
        return this.http.put<Order>(`${this.apiUrl}/${id}`, order);
    }

    deleteOrder(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
