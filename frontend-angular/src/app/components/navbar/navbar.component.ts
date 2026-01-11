import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KeycloakService } from '../../services/keycloak.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="brand">Catalogue App</a>
        
        <div class="nav-links">
          <a routerLink="/products" routerLinkActive="active">Produits</a>
          <a routerLink="/orders" routerLinkActive="active">Commandes</a>
        </div>

        <div class="user-section">
          <span class="username">{{ keycloakService.getFullName() }}</span>
          <span class="role-badge" [class.admin]="keycloakService.isAdmin()">
            {{ keycloakService.isAdmin() ? 'ADMIN' : 'CLIENT' }}
          </span>
          <button (click)="logout()" class="btn-logout">Déconnexion</button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background-color: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      padding: 0 20px;
      height: 60px;
      display: flex;
      align-items: center;
    }

    .nav-container {
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .brand {
      font-size: 1.2rem;
      font-weight: bold;
      color: #3f51b5;
      text-decoration: none;
    }

    .nav-links {
      display: flex;
      gap: 20px;
    }

    .nav-links a {
      text-decoration: none;
      color: #666;
      font-weight: 500;
      padding: 5px 10px;
      border-radius: 4px;
    }

    .nav-links a.active {
      color: #3f51b5;
      background-color: #e8eaf6;
    }

    .user-section {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .role-badge {
      background-color: #e0e0e0;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
    }

    .role-badge.admin {
      background-color: #ffebee;
      color: #c62828;
    }

    .btn-logout {
      background: none;
      border: 1px solid #ddd;
      padding: 5px 10px;
      font-size: 0.9rem;
    }
  `]
})
export class NavbarComponent {
  keycloakService = inject(KeycloakService);

  logout() {
    this.keycloakService.logout();
  }
}
