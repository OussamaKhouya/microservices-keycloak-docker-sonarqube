import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { OrderService } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { KeycloakService } from '../../services/keycloak.service';
import { Product } from '../../models/product.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container" [class.has-cart]="cartService.totalItems() > 0">
      <div class="header">
        <h1>Produits</h1>
        @if (keycloakService.isAdmin()) {
          <button class="btn-primary" (click)="openAdd()">+ Nouveau Produit</button>
        }
      </div>

      <!-- Formulaire Ajout / Edition -->
      @if (showForm()) {
        <div class="card form-card">
          <h3>{{ editingId() ? 'Modifier le produit' : 'Nouveau produit' }}</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Nom</label>
              <input type="text" [value]="formData().name" (input)="updateField('name', $event)">
            </div>
            <div class="form-group">
              <label>Prix (€)</label>
              <input type="number" [value]="formData().price" (input)="updateField('price', $event)">
            </div>
            <div class="form-group">
              <label>Stock</label>
              <input type="number" [value]="formData().stockQuantity" (input)="updateField('stockQuantity', $event)">
            </div>
            <div class="form-group full">
              <label>Description</label>
              <textarea [value]="formData().description" (input)="updateField('description', $event)"></textarea>
            </div>
          </div>
          <div class="actions">
            <button class="btn-secondary" (click)="cancelForm()">Annuler</button>
            <button class="btn-success" (click)="submitForm()">Sauvegarder</button>
          </div>
        </div>
      }

      <div class="grid">
        @for (product of products(); track product.id) {
          <div class="card product-card">
            <div class="product-header">
              <h3>{{ product.name }}</h3>
              <span class="price">{{ product.price | currency:'EUR' }}</span>
            </div>
            <p class="desc">{{ product.description }}</p>
            <div class="meta">
              <span [class.low-stock]="product.stockQuantity < 5">
                Stock: {{ product.stockQuantity }}
              </span>
            </div>
            
            <div class="card-actions">
              <div class="order-controls">
                <input type="number" 
                       min="1" 
                       [max]="product.stockQuantity" 
                       [ngModel]="quantities()[product.id] || 1" 
                       (ngModelChange)="updateQuantity(product.id, $event)"
                       class="qty-input">
                <button class="btn-primary" 
                        (click)="addToCart(product)"
                        [disabled]="product.stockQuantity === 0">
                  Ajouter au panier
                </button>
              </div>
              
              @if (keycloakService.isAdmin()) {
                <div class="admin-actions">
                  <button class="btn-secondary btn-sm" (click)="openEdit(product)">Edit</button>
                  <button class="btn-danger btn-sm" (click)="deleteProduct(product.id)">Del</button>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- PANIER FLOTTANT -->
    @if (cartService.totalItems() > 0) {
      <div class="cart-bar">
        <div class="cart-info">
          <span class="cart-count">{{ cartService.totalItems() }} articles</span>
          <span class="cart-total">Total: {{ cartService.totalPrice() | currency:'EUR' }}</span>
        </div>
        <div class="cart-items-preview">
            @for (item of cartService.items(); track item.product.id) {
                <span class="cart-item-tag">{{ item.product.name }} (x{{ item.quantity }})</span>
            }
        </div>
        <div class="cart-actions">
            <button class="btn-danger btn-sm" (click)="cartService.clearCart()">Vider</button>
            <button class="btn-success" (click)="checkout()">Valider la commande</button>
        </div>
      </div>
    }
  `,
  styles: [`
    .container { padding-bottom: 80px; } /* Space for cart bar */
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .product-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .price { font-weight: bold; color: #3f51b5; font-size: 1.2rem; }
    .desc { color: #666; font-size: 0.9rem; margin-bottom: 15px; min-height: 40px; }
    .meta { font-size: 0.85rem; color: #888; margin-bottom: 15px; }
    .low-stock { color: #f44336; font-weight: bold; }
    .card-actions { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #eee; padding-top: 15px; }
    .order-controls { display: flex; gap: 10px; align-items: center; }
    .qty-input { width: 60px; padding: 6px; margin: 0; }
    .admin-actions { display: flex; gap: 5px; }
    .form-card { border-left: 4px solid #3f51b5; margin-bottom: 20px; }
    .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 15px 0; }
    .form-group.full { grid-column: 1 / -1; }
    .actions { display: flex; justify-content: flex-end; gap: 10px; }
    .btn-sm { padding: 4px 8px; font-size: 0.8rem; }

    /* CART BAR STYLES */
    .cart-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #333;
      color: white;
      padding: 15px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
      z-index: 1000;
      animation: slideUp 0.3s ease-out;
    }

    @keyframes slideUp {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    .cart-info { display: flex; gap: 20px; align-items: center; font-size: 1.1rem; font-weight: bold; }
    .cart-count { background: #f50057; padding: 2px 8px; border-radius: 12px; font-size: 0.9rem; }
    .cart-items-preview { display: flex; gap: 10px; overflow-x: auto; max-width: 40%; font-size: 0.9rem; color: #ccc; }
    .cart-item-tag { white-space: nowrap; }
    .cart-actions { display: flex; gap: 10px; }
  `]
})
export class ProductsComponent implements OnInit {
  productService = inject(ProductService);
  orderService = inject(OrderService);
  keycloakService = inject(KeycloakService);
  cartService = inject(CartService);
  router = inject(Router);

  products = signal<Product[]>([]);
  quantities = signal<{ [key: number]: number }>({});

  showForm = signal(false);
  editingId = signal<number | null>(null);
  formData = signal<any>({ name: '', description: '', price: 0, stockQuantity: 0 });

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe(data => this.products.set(data));
  }

  updateQuantity(productId: number, qty: number) {
    this.quantities.update(curr => ({ ...curr, [productId]: qty }));
  }

  addToCart(product: Product) {
    const qty = this.quantities()[product.id] || 1;
    this.cartService.addToCart(product, qty);

    // Reset quantity input to 1 safely
    this.quantities.update(curr => {
      const next = { ...curr };
      delete next[product.id];
      return next;
    });
  }

  checkout() {
    if (confirm(`Confirmer la commande de ${this.cartService.totalItems()} articles pour ${this.cartService.totalPrice()} € ?`)) {
      const orderItems = this.cartService.items().map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      this.orderService.createOrder(orderItems).subscribe({
        next: () => {
          alert('Commande validée !');
          this.cartService.clearCart();
          this.router.navigate(['/orders']); // Redirect to orders page
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de la commande');
        }
      });
    }
  }

  // --- Form Logic ---
  updateField(field: string, event: Event) { this.formData.update(curr => ({ ...curr, [field]: (event.target as HTMLInputElement).value })); }
  openAdd() { this.editingId.set(null); this.formData.set({ name: '', description: '', price: 0, stockQuantity: 0 }); this.showForm.set(true); }
  openEdit(product: Product) { this.editingId.set(product.id); this.formData.set({ ...product }); this.showForm.set(true); }
  cancelForm() { this.showForm.set(false); }
  submitForm() {
    const data = this.formData();
    if (this.editingId()) {
      this.productService.updateProduct(this.editingId()!, { ...data, id: this.editingId()! }).subscribe(() => { this.loadProducts(); this.showForm.set(false); });
    } else {
      this.productService.createProduct({ ...data, id: 0 }).subscribe(() => { this.loadProducts(); this.showForm.set(false); });
    }
  }
  deleteProduct(id: number) { if (confirm('Supprimer ?')) this.productService.deleteProduct(id).subscribe(() => this.loadProducts()); }
}
