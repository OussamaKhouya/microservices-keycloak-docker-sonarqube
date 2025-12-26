import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
        canActivate: [authGuard]
    },
    {
        path: 'products',
        loadComponent: () => import('./components/products/products.component').then(m => m.ProductsComponent),
        canActivate: [authGuard]
    },
    {
        path: 'orders',
        loadComponent: () => import('./components/orders/orders.component').then(m => m.OrdersComponent),
        canActivate: [authGuard]
    },
    {
        path: 'forbidden',
        loadComponent: () => import('./components/forbidden/forbidden.component').then(m => m.ForbiddenComponent)
    },
    {
        path: '**',
        redirectTo: ''
    }
];
