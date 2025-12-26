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
    private readonly apiUrl = `${environment.apiGatewayUrl}/commande-service/api/commandes`;

    getAllOrders(): Observable<Order[]> {
        return this.http.get<Order[]>(this.apiUrl);
    }

    getOrderById(id: number): Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/${id}`);
    }

    createOrder(order: { productId: number; quantity: number }): Observable<Order> {
        return this.http.post<Order>(this.apiUrl, order);
    }

    deleteOrder(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
