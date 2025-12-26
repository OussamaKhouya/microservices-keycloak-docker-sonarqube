import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-forbidden',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="forbidden-page">
      <div class="forbidden-content">
        <div class="error-icon">🚫</div>
        <h1>403</h1>
        <h2>Accès Refusé</h2>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <a routerLink="/" class="btn-home">
          <span>🏠</span>
          Retour à l'accueil
        </a>
      </div>
    </div>
  `,
    styles: [`
    .forbidden-page {
      min-height: calc(100vh - 80px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .forbidden-content {
      text-align: center;
    }

    .error-icon {
      font-size: 5rem;
      margin-bottom: 1rem;
    }

    h1 {
      font-size: 6rem;
      color: #ff6b6b;
      margin: 0;
      line-height: 1;
    }

    h2 {
      font-size: 2rem;
      color: white;
      margin: 1rem 0;
    }

    p {
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 2rem;
      font-size: 1.1rem;
    }

    .btn-home {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      border-radius: 12px;
      background: linear-gradient(135deg, #00d9ff, #00ff88);
      color: #1a1a2e;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .btn-home:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(0, 217, 255, 0.3);
    }
  `]
})
export class ForbiddenComponent { }
