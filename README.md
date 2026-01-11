# E-Commerce Microservices Architecture (Secured with Keycloak)

Ce projet est une plateforme e-commerce complète basée sur une architecture microservices, sécurisée par **Keycloak** (OAuth2/OIDC) et disposant d'un frontend moderne en **Angular**.

L'ensemble de la plateforme est conteneurisée avec **Docker** pour un déploiement simplifié.

## Architecture Globale

Le système repose sur une communication centralisée via une API Gateway, avec une découverte de services dynamique (Eureka).

```mermaid
graph TD
    User((Utilisateur)) -->|HTTPS / 443| Nginx[Frontend Angular]
    Nginx -->|REST / 8888| Gateway[API Gateway]
    
    subgraph "Zone Sécurisée (Docker Network)"
        Gateway -->|Route /auth| Keycloak[Keycloak Identity Provider]
        Gateway -->|LB /product| Product[Product Service]
        Gateway -->|LB /order| Order[Order Service]
        
        Product -->|Register| Discovery[Eureka Discovery]
        Order -->|Register| Discovery
        Gateway -->|Discover| Discovery
        
        Order -->|Feign Client| Product
    end

    Keycloak -.->DB1[(H2 / Postgres)]
    Product -.->DB2[(H2 Database)]
    Order -.->DB3[(H2 Database)]
```

### Vue d'ensemble Virtualisation
![Architecture Docker](./screenshots/virtualisation.png)

## Fonctionnalités Clés & Démonstration

### 1. Infrastructure & Sécurité

**Service Discovery (Eureka)**
Tous les microservices s'enregistrent dynamiquement auprès d'Eureka.
![Eureka Dashboard](./screenshots/eureka.png)

**Gateway & Routing**
L'API Gateway centralise les requêtes. Ici un test d'accès aux produits via la Gateway.
![Gateway Products](./screenshots/test-gatway-products.png)

**Authentification Keycloak**
Gestion des utilisateurs et des rôles (ADMIN, USER) via Keycloak.
![Utilisateurs](./screenshots/users.png)
![Rôles](./screenshots/roles.png)
![Obtention Token](./screenshots/getToken.png)

### 2. Gestion des Produits (Product-Service)

**API REST Produits**
- Récupération de tous les produits :
  ![Get Products](./screenshots/getProducts.png)
- Consultation d'un produit spécifique :
  ![Get Product By ID](./screenshots/getProductById.png)

**Persistance H2**
Vue de la base de données H2 pour les produits.
![Product H2 DB](./screenshots/productH2DB.png)

**Sécurité (RBAC)**
Un utilisateur simple ne peut pas ajouter de produit (403 Forbidden).
![Forbidden Add Product](./screenshots/addProductasUser-forbidden.png)

### 3. Gestion des Commandes (Order-Service)

**API REST Commandes**
- Création et consultation des commandes :
  ![Get Commandes](./screenshots/getCommandes.png)
- Mise à jour (ex: Statut) :
  ![Update Commande](./screenshots/updateCommande.png)
- Suppression :
  ![Delete Commande](./screenshots/deleteCommande.png)

**Persistance H2**
Vue de la base de données H2 pour les commandes.
![Commande H2 DB](./screenshots/commandeH2DB.png)

---

## Pré-requis

- **Docker** & Docker Compose
- **Java 21** (si exécution locale)
- **Node.js 22** (si exécution locale)

## Installation et Démarrage (Docker)

1. **Cloner le projet**
   ```bash
   git clone https://github.com/votre-repo/tp4-security.git
   cd tp4-security
   ```

2. **Lancer la stack**
   ```bash
   docker-compose up --build
   ```

3. **Accéder à l'application**
   - Frontend : [http://localhost:4200](http://localhost:4200)
   - Keycloak Console : [http://localhost:8080](http://localhost:8080)
   - Eureka Dashboard : [http://localhost:8761](http://localhost:8761)
