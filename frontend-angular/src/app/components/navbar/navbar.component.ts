import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KeycloakService } from '../../services/keycloak.service';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <nav class="navbar">
      <div class="navbar-container">
        <a routerLink="/" class="navbar-brand">
          <span class="brand-icon">🛒</span>
          <span class="brand-text">E-Commerce</span>
        </a>
        
        <div class="navbar-menu">
          <a routerLink="/products" routerLinkActive="active" class="nav-link">
            <span class="nav-icon">📦</span>
            Produits
          </a>
          <a routerLink="/orders" routerLinkActive="active" class="nav-link">
            <span class="nav-icon">📋</span>
            Commandes
          </a>
          @if (keycloakService.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="active" class="nav-link admin-link">
              <span class="nav-icon">⚙️</span>
              Admin
            </a>
          }
        </div>

        <div class="navbar-user">
          <div class="user-info">
            <span class="user-avatar">{{ getUserInitials() }}</span>
            <div class="user-details">
              <span class="user-name">{{ keycloakService.getFullName() }}</span>
              <span class="user-role">{{ getUserRole() }}</span>
            </div>
          </div>
          <button class="btn-logout" (click)="logout()">
            <span>🚪</span>
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  `,
    styles: [`
    .navbar {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      padding: 1rem 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: white;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .brand-icon {
      font-size: 2rem;
    }

    .brand-text {
      background: linear-gradient(135deg, #00d9ff, #00ff88);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .navbar-menu {
      display: flex;
      gap: 0.5rem;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      text-decoration: none;
      color: rgba(255, 255, 255, 0.8);
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      transform: translateY(-2px);
    }

    .nav-link.active {
      background: linear-gradient(135deg, #00d9ff 0%, #00ff88 100%);
      color: #1a1a2e;
    }

    .admin-link {
      color: #ff6b6b;
    }

    .admin-link.active {
      background: linear-gradient(135deg, #ff6b6b 0%, #ffa726 100%);
    }

    .nav-icon {
      font-size: 1.2rem;
    }

    .navbar-user {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00d9ff, #00ff88);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      color: #1a1a2e;
      font-size: 0.9rem;
    }

    .user-details {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .user-role {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .btn-logout {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1rem;
      border: none;
      border-radius: 10px;
      background: rgba(255, 107, 107, 0.2);
      color: #ff6b6b;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-logout:hover {
      background: #ff6b6b;
      color: white;
      transform: translateY(-2px);
    }
  `]
})
export class NavbarComponent {
    keycloakService = inject(KeycloakService);

    getUserInitials(): string {
        const name = this.keycloakService.getFullName();
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    getUserRole(): string {
        if (this.keycloakService.isAdmin()) {
            return 'Administrateur';
        }
        return 'Utilisateur';
    }

    logout(): void {
        this.keycloakService.logout();
    }
}
