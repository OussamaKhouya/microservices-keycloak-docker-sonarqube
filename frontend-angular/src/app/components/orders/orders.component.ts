import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services/order.service';
import { KeycloakService } from '../../services/keycloak.service';
import { Order } from '../../models/order.model';

@Component({
    selector: 'app-orders',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="orders-page">
      <header class="page-header">
        <div class="header-content">
          <h1>📋 Mes Commandes</h1>
          <p>Historique et suivi de vos commandes</p>
        </div>
        <button class="btn-refresh" (click)="loadOrders()">
          <span>🔄</span>
          Actualiser
        </button>
      </header>

      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Chargement des commandes...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <span class="error-icon">⚠️</span>
          <p>{{ error() }}</p>
          <button class="btn-retry" (click)="loadOrders()">Réessayer</button>
        </div>
      } @else {
        <div class="orders-container">
          @for (order of orders(); track order.id) {
            <div class="order-card">
              <div class="order-header">
                <div class="order-id">
                  <span class="label">Commande</span>
                  <span class="value">#{{ order.id }}</span>
                </div>
                <span class="order-status" [class]="getStatusClass(order.status)">
                  {{ getStatusLabel(order.status) }}
                </span>
              </div>
              
              <div class="order-details">
                <div class="detail-item">
                  <span class="detail-icon">📅</span>
                  <div class="detail-content">
                    <span class="detail-label">Date</span>
                    <span class="detail-value">{{ formatDate(order.orderDate) }}</span>
                  </div>
                </div>
                <div class="detail-item">
                  <span class="detail-icon">💰</span>
                  <div class="detail-content">
                    <span class="detail-label">Total</span>
                    <span class="detail-value price">{{ order.totalAmount | currency:'EUR' }}</span>
                  </div>
                </div>
                <div class="detail-item">
                  <span class="detail-icon">📦</span>
                  <div class="detail-content">
                    <span class="detail-label">Articles</span>
                    <span class="detail-value">{{ order.orderItems?.length || 0 }} produit(s)</span>
                  </div>
                </div>
              </div>

              @if (order.orderItems && order.orderItems.length > 0) {
                <div class="order-items">
                  <h4>Détails des articles</h4>
                  <div class="items-list">
                    @for (item of order.orderItems; track item.id) {
                      <div class="item-row">
                        <span class="item-name">{{ item.product?.name || 'Produit #' + item.productId }}</span>
                        <span class="item-qty">x{{ item.quantity }}</span>
                        <span class="item-price">{{ (item.unitPrice || 0) * item.quantity | currency:'EUR' }}</span>
                      </div>
                    }
                  </div>
                </div>
              }

              @if (keycloakService.isAdmin()) {
                <div class="order-actions">
                  <button class="btn-delete" (click)="deleteOrder(order.id!)">
                    <span>🗑️</span>
                    Supprimer
                  </button>
                </div>
              }
            </div>
          } @empty {
            <div class="empty-state">
              <span class="empty-icon">📭</span>
              <h3>Aucune commande</h3>
              <p>Vous n'avez pas encore passé de commande</p>
            </div>
          }
        </div>
      }
    </div>
  `,
    styles: [`
    .orders-page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .header-content h1 {
      font-size: 2rem;
      color: white;
      margin-bottom: 0.5rem;
    }

    .header-content p {
      color: rgba(255, 255, 255, 0.6);
    }

    .btn-refresh {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.8rem 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      background: transparent;
      color: white;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-refresh:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(0, 217, 255, 0.5);
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem;
    }

    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-top-color: #00d9ff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .loading-container p {
      margin-top: 1rem;
      color: rgba(255, 255, 255, 0.6);
    }

    .error-container {
      text-align: center;
      padding: 4rem;
      color: #ff6b6b;
    }

    .error-icon {
      font-size: 3rem;
    }

    .btn-retry {
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      background: #ff6b6b;
      color: white;
      cursor: pointer;
    }

    .orders-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .order-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .order-card:hover {
      border-color: rgba(0, 217, 255, 0.3);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 1.5rem;
      background: rgba(0, 0, 0, 0.2);
    }

    .order-id .label {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.85rem;
      display: block;
    }

    .order-id .value {
      color: white;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .order-status {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .order-status.pending {
      background: rgba(255, 193, 7, 0.2);
      color: #ffc107;
    }

    .order-status.processing {
      background: rgba(0, 217, 255, 0.2);
      color: #00d9ff;
    }

    .order-status.completed {
      background: rgba(0, 255, 136, 0.2);
      color: #00ff88;
    }

    .order-status.cancelled {
      background: rgba(255, 107, 107, 0.2);
      color: #ff6b6b;
    }

    .order-details {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      padding: 1.5rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .detail-icon {
      font-size: 1.5rem;
      width: 45px;
      height: 45px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .detail-label {
      display: block;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.85rem;
    }

    .detail-value {
      color: white;
      font-weight: 600;
    }

    .detail-value.price {
      font-size: 1.1rem;
      background: linear-gradient(135deg, #00d9ff, #00ff88);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .order-items {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .order-items h4 {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 1rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .item-row {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 8px;
    }

    .item-name {
      flex: 1;
      color: white;
    }

    .item-qty {
      color: rgba(255, 255, 255, 0.6);
      margin-right: 1rem;
    }

    .item-price {
      color: #00ff88;
      font-weight: 600;
    }

    .order-actions {
      padding: 1rem 1.5rem;
      background: rgba(0, 0, 0, 0.2);
      display: flex;
      justify-content: flex-end;
    }

    .btn-delete {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      border: none;
      border-radius: 8px;
      background: rgba(255, 107, 107, 0.2);
      color: #ff6b6b;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-delete:hover {
      background: #ff6b6b;
      color: white;
    }

    .empty-state {
      text-align: center;
      padding: 4rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 20px;
      border: 1px dashed rgba(255, 255, 255, 0.1);
    }

    .empty-icon {
      font-size: 4rem;
    }

    .empty-state h3 {
      color: white;
      margin: 1rem 0 0.5rem;
    }

    .empty-state p {
      color: rgba(255, 255, 255, 0.5);
    }
  `]
})
export class OrdersComponent implements OnInit {
    private readonly orderService = inject(OrderService);
    keycloakService = inject(KeycloakService);

    orders = signal<Order[]>([]);
    loading = signal(true);
    error = signal<string | null>(null);

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(): void {
        this.loading.set(true);
        this.error.set(null);

        this.orderService.getAllOrders().subscribe({
            next: (data) => {
                this.orders.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set('Erreur lors du chargement des commandes');
                this.loading.set(false);
                console.error(err);
            }
        });
    }

    formatDate(dateString?: string): string {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    getStatusClass(status?: string): string {
        if (!status) return 'pending';
        return status.toLowerCase();
    }

    getStatusLabel(status?: string): string {
        const labels: Record<string, string> = {
            'pending': 'En attente',
            'processing': 'En cours',
            'completed': 'Terminée',
            'cancelled': 'Annulée'
        };
        return labels[status?.toLowerCase() || ''] || 'En attente';
    }

    deleteOrder(id: number): void {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
            this.orderService.deleteOrder(id).subscribe({
                next: () => this.loadOrders(),
                error: (err) => console.error(err)
            });
        }
    }
}
