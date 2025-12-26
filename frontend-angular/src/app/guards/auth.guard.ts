import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from '../services/keycloak.service';

export const authGuard: CanActivateFn = () => {
    const keycloakService = inject(KeycloakService);

    if (keycloakService.isAuthenticated()) {
        return true;
    }

    // If not authenticated, the KeycloakService will handle the redirect
    // Just return false for now
    return false;
};

export const adminGuard: CanActivateFn = () => {
    const keycloakService = inject(KeycloakService);
    const router = inject(Router);

    if (keycloakService.isAuthenticated() && keycloakService.isAdmin()) {
        return true;
    }

    if (!keycloakService.isAuthenticated()) {
        return false;
    }

    // User is authenticated but not admin
    router.navigate(['/forbidden']);
    return false;
};
