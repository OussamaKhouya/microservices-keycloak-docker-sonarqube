import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class KeycloakService {
    private keycloak: Keycloak;
    private authenticated = false;

    constructor() {
        this.keycloak = new Keycloak({
            url: environment.keycloak.url,
            realm: environment.keycloak.realm,
            clientId: environment.keycloak.clientId
        });
    }

    async init(): Promise<boolean> {
        try {
            // Use login-required but with proper settings to prevent loop
            this.authenticated = await this.keycloak.init({
                onLoad: 'login-required',
                checkLoginIframe: false,
                pkceMethod: 'S256',
                flow: 'standard'
            });

            console.log('Keycloak authenticated:', this.authenticated);

            // Auto-refresh token
            if (this.authenticated) {
                this.setupTokenRefresh();
            }

            return this.authenticated;
        } catch (error) {
            console.error('Keycloak init failed:', error);
            return false;
        }
    }

    private setupTokenRefresh(): void {
        // Refresh token before it expires
        this.keycloak.onTokenExpired = () => {
            console.log('Token expired, refreshing...');
            this.keycloak.updateToken(30).then(refreshed => {
                if (refreshed) {
                    console.log('Token was successfully refreshed');
                } else {
                    console.log('Token is still valid');
                }
            }).catch(() => {
                console.error('Failed to refresh the token, logging out');
                this.logout();
            });
        };
    }

    isAuthenticated(): boolean {
        return this.authenticated && !!this.keycloak.token;
    }

    getToken(): string | undefined {
        return this.keycloak.token;
    }

    getUsername(): string {
        return this.keycloak.tokenParsed?.['preferred_username'] || 'Unknown';
    }

    getFullName(): string {
        const tokenParsed = this.keycloak.tokenParsed;
        if (tokenParsed) {
            const firstName = tokenParsed['given_name'] || '';
            const lastName = tokenParsed['family_name'] || '';
            return `${firstName} ${lastName}`.trim() || this.getUsername();
        }
        return this.getUsername();
    }

    getEmail(): string {
        return this.keycloak.tokenParsed?.['email'] || '';
    }

    getRoles(): string[] {
        const realmRoles = this.keycloak.tokenParsed?.['realm_access']?.['roles'] || [];
        const clientRoles = this.keycloak.tokenParsed?.['resource_access']?.[environment.keycloak.clientId]?.['roles'] || [];
        return [...realmRoles, ...clientRoles];
    }

    hasRole(role: string): boolean {
        return this.getRoles().includes(role);
    }

    isAdmin(): boolean {
        return this.hasRole('ADMIN');
    }

    isUser(): boolean {
        return this.hasRole('CLIENT') || this.hasRole('ADMIN');
    }

    login(): void {
        this.keycloak.login();
    }

    logout(): void {
        this.keycloak.logout({
            redirectUri: window.location.origin
        });
    }

    getKeycloakInstance(): Keycloak {
        return this.keycloak;
    }
}
