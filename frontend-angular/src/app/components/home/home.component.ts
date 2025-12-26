import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { KeycloakService } from '../../services/keycloak.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="home-page">
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">
            Bienvenue, <span class="highlight">{{ keycloakService.getFullName() }}</span> ! 👋
          </h1>
          <p class="hero-subtitle">
            Gérez vos produits et commandes en toute sécurité avec notre plateforme e-commerce sécurisée
          </p>
          <div class="hero-actions">
            <a routerLink="/products" class="btn-primary">
              <span>📦</span>
              Voir les produits
            </a>
            <a routerLink="/orders" class="btn-secondary">
              <span>📋</span>
              Mes commandes
            </a>
          </div>
        </div>
        <div class="hero-graphic">
          <div class="floating-card card-1">🛒</div>
          <div class="floating-card card-2">📦</div>
          <div class="floating-card card-3">🔐</div>
        </div>
      </div>

      <div class="features-section">
        <h2>Fonctionnalités</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🔐</div>
            <h3>Sécurisé</h3>
            <p>Authentification OAuth2 avec Keycloak pour une sécurité maximale</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📦</div>
            <h3>Catalogue</h3>
            <p>Parcourez notre catalogue de produits et passez vos commandes</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📋</div>
            <h3>Suivi</h3>
            <p>Suivez l'état de vos commandes en temps réel</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👤</div>
            <h3>Rôles</h3>
            <p>Interface adaptée selon votre profil utilisateur</p>
          </div>
        </div>
      </div>

      <div class="user-info-section">
        <h2>Votre profil</h2>
        <div class="profile-card">
          <div class="profile-avatar">
            {{ getUserInitials() }}
          </div>
          <div class="profile-details">
            <div class="profile-row">
              <span class="label">Nom complet</span>
              <span class="value">{{ keycloakService.getFullName() }}</span>
            </div>
            <div class="profile-row">
              <span class="label">Nom d'utilisateur</span>
              <span class="value">{{ keycloakService.getUsername() }}</span>
            </div>
            <div class="profile-row">
              <span class="label">Email</span>
              <span class="value">{{ keycloakService.getEmail() || 'Non renseigné' }}</span>
            </div>
            <div class="profile-row">
              <span class="label">Rôles</span>
              <div class="roles">
                @for (role of getDisplayRoles(); track role) {
                  <span class="role-badge" [class.admin]="role === 'ADMIN'">{{ role }}</span>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .home-page {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .hero-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
      padding: 3rem 0;
    }

    .hero-title {
      font-size: 2.5rem;
      color: white;
      margin-bottom: 1rem;
      line-height: 1.2;
    }

    .highlight {
      background: linear-gradient(135deg, #00d9ff, #00ff88);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
    }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      background: linear-gradient(135deg, #00d9ff, #00ff88);
      color: #1a1a2e;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(0, 217, 255, 0.3);
    }

    .btn-secondary {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      text-decoration: none;
      font-weight: 500;
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: all 0.3s ease;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: translateY(-3px);
    }

    .hero-graphic {
      position: relative;
      height: 300px;
    }

    .floating-card {
      position: absolute;
      width: 80px;
      height: 80px;
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      animation: float 3s ease-in-out infinite;
    }

    .card-1 {
      top: 20%;
      left: 20%;
      background: linear-gradient(135deg, #00d9ff, #0099ff);
      animation-delay: 0s;
    }

    .card-2 {
      top: 40%;
      right: 20%;
      background: linear-gradient(135deg, #00ff88, #00cc6a);
      animation-delay: 0.5s;
    }

    .card-3 {
      bottom: 20%;
      left: 40%;
      background: linear-gradient(135deg, #ff6b6b, #ff8e53);
      animation-delay: 1s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    .features-section {
      margin: 4rem 0;
    }

    .features-section h2 {
      color: white;
      font-size: 1.75rem;
      margin-bottom: 2rem;
      text-align: center;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 1.5rem;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      border-color: rgba(0, 217, 255, 0.3);
    }

    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      color: white;
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
    }

    .feature-card p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .user-info-section {
      margin: 4rem 0;
    }

    .user-info-section h2 {
      color: white;
      font-size: 1.75rem;
      margin-bottom: 1.5rem;
    }

    .profile-card {
      display: flex;
      gap: 2rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .profile-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: linear-gradient(135deg, #00d9ff, #00ff88);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 700;
      color: #1a1a2e;
      flex-shrink: 0;
    }

    .profile-details {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .profile-row {
      display: flex;
      align-items: center;
    }

    .profile-row .label {
      width: 150px;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.9rem;
    }

    .profile-row .value {
      color: white;
      font-weight: 500;
    }

    .roles {
      display: flex;
      gap: 0.5rem;
    }

    .role-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      background: rgba(0, 217, 255, 0.2);
      color: #00d9ff;
    }

    .role-badge.admin {
      background: rgba(255, 107, 107, 0.2);
      color: #ff6b6b;
    }

    @media (max-width: 1024px) {
      .features-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (max-width: 768px) {
      .hero-section {
        grid-template-columns: 1fr;
      }

      .hero-graphic {
        display: none;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .profile-card {
        flex-direction: column;
        align-items: center;
        text-align: center;
      }

      .profile-row {
        flex-direction: column;
        gap: 0.25rem;
      }

      .profile-row .label {
        width: auto;
      }
    }
  `]
})
export class HomeComponent {
    keycloakService = inject(KeycloakService);

    getUserInitials(): string {
        const name = this.keycloakService.getFullName();
        const parts = name.split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    }

    getDisplayRoles(): string[] {
        const allRoles = this.keycloakService.getRoles();
        // Filter out Keycloak internal roles
        return allRoles.filter(role =>
            !role.startsWith('default-roles-') &&
            !role.includes('offline_access') &&
            !role.includes('uma_authorization')
        );
    }
}
