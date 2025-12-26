import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { KeycloakService } from '../../services/keycloak.service';
import { Product } from '../../models/product.model';

@Component({
    selector: 'app-products',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="products-page">
      <header class="page-header">
        <div class="header-content">
          <h1>📦 Catalogue des Produits</h1>
          <p>Découvrez notre sélection de produits de qualité</p>
        </div>
        @if (keycloakService.isAdmin()) {
          <button class="btn-add" (click)="toggleAddForm()">
            <span>➕</span>
            Ajouter un produit
          </button>
        }
      </header>

      @if (showAddForm()) {
        <div class="add-form-container">
          <div class="add-form">
            <h3>Nouveau Produit</h3>
            <div class="form-grid">
              <div class="form-group">
                <label>Nom</label>
                <input type="text" #nameInput placeholder="Nom du produit">
              </div>
              <div class="form-group">
                <label>Prix (€)</label>
                <input type="number" #priceInput placeholder="0.00">
              </div>
              <div class="form-group">
                <label>Stock</label>
                <input type="number" #stockInput placeholder="0">
              </div>
              <div class="form-group full-width">
                <label>Description</label>
                <textarea #descInput placeholder="Description du produit"></textarea>
              </div>
            </div>
            <div class="form-actions">
              <button class="btn-cancel" (click)="toggleAddForm()">Annuler</button>
              <button class="btn-save" (click)="addProduct(nameInput.value, descInput.value, +priceInput.value, +stockInput.value)">
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      }

      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Chargement des produits...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <span class="error-icon">⚠️</span>
          <p>{{ error() }}</p>
          <button class="btn-retry" (click)="loadProducts()">Réessayer</button>
        </div>
      } @else {
        <div class="products-grid">
          @for (product of products(); track product.id) {
            <div class="product-card">
              <div class="product-image">
                <span class="product-emoji">{{ getProductEmoji(product.name) }}</span>
              </div>
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <p class="product-description">{{ product.description }}</p>
                <div class="product-meta">
                  <span class="product-price">{{ product.price | currency:'EUR' }}</span>
                  <span class="stock-badge" [class.low-stock]="product.stockQuantity < 10">
                    {{ product.stockQuantity }} en stock
                  </span>
                </div>
              </div>
              <div class="product-actions">
                <button class="btn-order" (click)="orderProduct(product)" [disabled]="product.stockQuantity === 0">
                  <span>🛒</span>
                  Commander
                </button>
                @if (keycloakService.isAdmin()) {
                  <button class="btn-delete" (click)="deleteProduct(product.id)">
                    <span>🗑️</span>
                  </button>
                }
              </div>
            </div>
          } @empty {
            <div class="empty-state">
              <span class="empty-icon">📭</span>
              <p>Aucun produit disponible</p>
            </div>
          }
        </div>
      }

      @if (orderSuccess()) {
        <div class="toast success">
          ✅ Commande créée avec succès !
        </div>
      }
    </div>
  `,
    styles: [`
    .products-page {
      padding: 2rem;
      max-width: 1400px;
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

    .btn-add {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.8rem 1.5rem;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #00d9ff, #00ff88);
      color: #1a1a2e;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-add:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(0, 217, 255, 0.3);
    }

    .add-form-container {
      margin-bottom: 2rem;
    }

    .add-form {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .add-form h3 {
      color: white;
      margin-bottom: 1rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
    }

    .form-group input,
    .form-group textarea {
      padding: 0.75rem;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      background: rgba(0, 0, 0, 0.3);
      color: white;
      font-size: 1rem;
    }

    .form-group textarea {
      min-height: 80px;
      resize: vertical;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }

    .btn-cancel {
      padding: 0.75rem 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      background: transparent;
      color: white;
      cursor: pointer;
    }

    .btn-save {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      background: linear-gradient(135deg, #00d9ff, #00ff88);
      color: #1a1a2e;
      font-weight: 600;
      cursor: pointer;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
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

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .product-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .product-card:hover {
      transform: translateY(-5px);
      border-color: rgba(0, 217, 255, 0.3);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    }

    .product-image {
      height: 160px;
      background: linear-gradient(135deg, #1a1a2e, #16213e);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .product-emoji {
      font-size: 4rem;
    }

    .product-info {
      padding: 1.5rem;
    }

    .product-name {
      font-size: 1.25rem;
      color: white;
      margin-bottom: 0.5rem;
    }

    .product-description {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .product-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .product-price {
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #00d9ff, #00ff88);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .stock-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      background: rgba(0, 255, 136, 0.2);
      color: #00ff88;
    }

    .stock-badge.low-stock {
      background: rgba(255, 107, 107, 0.2);
      color: #ff6b6b;
    }

    .product-actions {
      padding: 1rem 1.5rem;
      background: rgba(0, 0, 0, 0.2);
      display: flex;
      gap: 0.75rem;
    }

    .btn-order {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem;
      border: none;
      border-radius: 10px;
      background: linear-gradient(135deg, #00d9ff, #00ff88);
      color: #1a1a2e;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-order:hover:not(:disabled) {
      transform: scale(1.02);
    }

    .btn-order:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-delete {
      padding: 0.75rem;
      border: none;
      border-radius: 10px;
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
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem;
      color: rgba(255, 255, 255, 0.5);
    }

    .empty-icon {
      font-size: 4rem;
    }

    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      font-weight: 500;
      animation: slideIn 0.3s ease;
    }

    .toast.success {
      background: rgba(0, 255, 136, 0.2);
      color: #00ff88;
      border: 1px solid rgba(0, 255, 136, 0.3);
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `]
})
export class ProductsComponent implements OnInit {
    private readonly productService = inject(ProductService);
    private readonly orderService = inject(OrderService);
    keycloakService = inject(KeycloakService);

    products = signal<Product[]>([]);
    loading = signal(true);
    error = signal<string | null>(null);
    showAddForm = signal(false);
    orderSuccess = signal(false);

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts(): void {
        this.loading.set(true);
        this.error.set(null);

        this.productService.getAllProducts().subscribe({
            next: (data) => {
                this.products.set(data);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set('Erreur lors du chargement des produits');
                this.loading.set(false);
                console.error(err);
            }
        });
    }

    getProductEmoji(name: string): string {
        const lower = name.toLowerCase();
        if (lower.includes('laptop') || lower.includes('ordinateur')) return '💻';
        if (lower.includes('phone') || lower.includes('smartphone')) return '📱';
        if (lower.includes('tablet') || lower.includes('tablette')) return '📱';
        if (lower.includes('watch') || lower.includes('montre')) return '⌚';
        if (lower.includes('headphone') || lower.includes('casque')) return '🎧';
        if (lower.includes('camera')) return '📷';
        if (lower.includes('keyboard') || lower.includes('clavier')) return '⌨️';
        if (lower.includes('mouse') || lower.includes('souris')) return '🖱️';
        return '📦';
    }

    toggleAddForm(): void {
        this.showAddForm.update(v => !v);
    }

    addProduct(name: string, description: string, price: number, stock: number): void {
        const product: Product = { id: 0, name, description, price, stockQuantity: stock };
        this.productService.createProduct(product).subscribe({
            next: () => {
                this.loadProducts();
                this.showAddForm.set(false);
            },
            error: (err) => console.error(err)
        });
    }

    deleteProduct(id: number): void {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
            this.productService.deleteProduct(id).subscribe({
                next: () => this.loadProducts(),
                error: (err) => console.error(err)
            });
        }
    }

    orderProduct(product: Product): void {
        this.orderService.createOrder({ productId: product.id, quantity: 1 }).subscribe({
            next: () => {
                this.orderSuccess.set(true);
                setTimeout(() => this.orderSuccess.set(false), 3000);
                this.loadProducts();
            },
            error: (err) => console.error(err)
        });
    }
}
