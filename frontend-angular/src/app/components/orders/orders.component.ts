import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Import FormsModule for ngModel if needed
import { OrderService } from '../../services/order.service';
import { KeycloakService } from '../../services/keycloak.service';
import { Order } from '../../models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Mes Commandes</h1>
      
      <div class="card">
        @if (orders().length === 0) {
          <p>Aucune commande trouvée.</p>
        } @else {
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Articles</th>
                <th>Total</th>
                <th>Statut</th>
                @if (keycloakService.isAdmin()) {
                  <th>Actions</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (order of orders(); track order.id) {
                <tr>
                  <td>#{{ order.id }}</td>
                  <td>{{ order.orderDate | date:'short' }}</td>
                  <td>
                    <ul>
                      @for (item of order.orderItems; track item.id) {
                        <li>
                          @if (item.product) {
                            <strong>{{ item.product.name }}</strong>
                          } @else {
                            Product #{{ item.productId }}
                          }
                          (x{{ item.quantity }}) 
                          - {{ (item.price || item.unitPrice || 0) * item.quantity | currency:'EUR' }}
                        </li>
                      } @empty {
                        <li>Aucun article</li>
                      }
                    </ul>
                  </td>
                  <td class="total">
                    {{ calculateTotal(order) | currency:'EUR' }}
                  </td>
                  <td>
                    @if (keycloakService.isAdmin()) {
                      <select [value]="order.status || 'PENDING'" 
                              (change)="updateStatus(order, $event)">
                        <option value="PENDING">En attente</option>
                        <option value="CONFIRMED">Confirmée</option>
                        <option value="SHIPPED">Expédiée</option>
                        <option value="DELIVERED">Livrée</option>
                        <option value="CANCELLED">Annulée</option>
                      </select>
                    } @else {
                      <span class="status-badge" [class]="getStatusClass(order.status)">
                        {{ order.status || 'PENDING' }}
                      </span>
                    }
                  </td>
                  @if (keycloakService.isAdmin()) {
                    <td>
                      <button class="btn-danger btn-sm" (click)="deleteOrder(order.id!)">X</button>
                    </td>
                  }
                </tr>
              }
            </tbody>
          </table>
        }
      </div>
    </div>
  `,
  styles: [`
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 12px 15px; text-align: left; border-bottom: 1px solid #eee; vertical-align: top; }
    .table th { background-color: #f8f9fa; font-weight: 600; color: #333; }
    .table tr:hover { background-color: #fafafa; }
    ul { list-style: none; padding: 0; margin: 0; font-size: 0.9rem; color: #666; }
    .total { font-weight: bold; color: #3f51b5; }
    .status-badge { padding: 4px 8px; border-radius: 4px; font-size: 0.85rem; font-weight: 500; background-color: #eee; }
    .status-badge.CONFIRMED { background-color: #e3f2fd; color: #1976d2; }
    .status-badge.SHIPPED { background-color: #fff3e0; color: #f57c00; }
    .status-badge.DELIVERED { background-color: #e8f5e9; color: #388e3c; }
    .status-badge.CANCELLED { background-color: #ffebee; color: #c62828; }
    select { padding: 4px; border-radius: 4px; border: 1px solid #ddd; }
    .btn-sm { padding: 4px 8px; font-size: 0.8rem; }
  `]
})
export class OrdersComponent implements OnInit {
  orderService = inject(OrderService);
  keycloakService = inject(KeycloakService);

  orders = signal<Order[]>([]);

  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getAllOrders().subscribe({
      next: (data) => {
        console.log('Orders received:', data); // DEBUG
        if (data.length > 0) {
          console.log('First order items:', data[0].orderItems);
        }
        this.orders.set(data);
      },
      error: (err) => console.error('Error fetching orders:', err)
    });
  }

  calculateTotal(order: Order): number {
    if (order.totalAmount && order.totalAmount > 0) return order.totalAmount;

    // Fallback calculation if backend sends 0
    return (order.orderItems || []).reduce((acc, item) => {
      // Use item.price (from backend) or item.unitPrice (frontend model alias) or fallback to 0
      const price = item.price || item.unitPrice || item.product?.price || 0;
      return acc + (price * item.quantity);
    }, 0);
  }

  getStatusClass(status?: string): string {
    return status ? status.toUpperCase() : 'PENDING';
  }

  updateStatus(order: Order, event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value;
    if (!order.id) return;

    // Create updated order object
    const updatedOrder: Order = { ...order, status: newStatus };

    this.orderService.updateOrder(order.id, updatedOrder).subscribe({
      next: () => {
        this.loadOrders();
      },
      error: (err) => {
        console.error('Failed to update status', err);
        alert('Erreur lors de la mise à jour du statut');
      }
    });
  }

  deleteOrder(id: number) {
    if (confirm('Supprimer cette commande ?')) {
      this.orderService.deleteOrder(id).subscribe(() => this.loadOrders());
    }
  }
}
