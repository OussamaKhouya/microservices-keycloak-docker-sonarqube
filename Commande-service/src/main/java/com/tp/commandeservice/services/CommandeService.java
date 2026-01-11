package com.tp.commandeservice.services;

import com.tp.commandeservice.clients.ProductRestClient;
import com.tp.commandeservice.entities.Commande;
import com.tp.commandeservice.entities.OrderItem;
import com.tp.commandeservice.model.Product;
import com.tp.commandeservice.repository.CommandeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CommandeService {
    private final CommandeRepository commandeRepository;
    private final ProductRestClient productRestClient;

    public CommandeService(CommandeRepository commandeRepository, ProductRestClient productRestClient) {
        this.commandeRepository = commandeRepository;
        this.productRestClient = productRestClient;
    }

    public Commande getCommandeById(Long id, Authentication authentication) {
        Commande commande = commandeRepository.findById(id).orElse(null);
        if (commande == null) {
            return null;
        }
        if (!isAdmin(authentication) && !commande.getUserId().equals(getUserId(authentication))) {
            throw new AccessDeniedException("Not allowed to view this order");
        }
        enrichProducts(List.of(commande));
        return commande;
    }

    public Commande createCommande(Commande commande, Authentication authentication) {
        if (commande.getOrderDate() == null) {
            commande.setOrderDate(LocalDateTime.now());
        }
        commande.setUserId(getUserId(authentication));

        double total = 0.0;

        if (commande.getOrderItems() != null) {
            for (OrderItem item : commande.getOrderItems()) {
                Product product = productRestClient.getProductById(item.getProductId());
                if (product == null) {
                    throw new RuntimeException("Product not found with ID: " + item.getProductId());
                }
                if (product.getStockQuantity() < item.getQuantity()) {
                    throw new RuntimeException("Insufficient stock for product: " + product.getName());
                }

                // Update item price from product service source of truth
                item.setPrice(product.getPrice());
                item.setProduct(product); // Set for response

                total += item.getPrice() * item.getQuantity();
                item.setCommande(commande);
            }
        }

        commande.setTotalAmount(total);

        return commandeRepository.save(commande);
    }

    public Commande updateCommande(Long id, Commande commandeDetails) {
        Commande commande = commandeRepository.findById(id).orElse(null);
        if (commande != null) {
            commande.setStatus(commandeDetails.getStatus());
            commande.setTotalAmount(commandeDetails.getTotalAmount());
            return commandeRepository.save(commande);
        }
        return null;
    }

    public void deleteCommandeById(Long id) {
        commandeRepository.deleteById(id);
    }

    public List<Commande> getAllCommandes(Authentication authentication) {
        List<Commande> commandes = isAdmin(authentication)
                ? commandeRepository.findAll()
                : commandeRepository.findByUserId(getUserId(authentication));
        enrichProducts(commandes);
        return commandes;
    }

    private void enrichProducts(List<Commande> commandes) {
        commandes.forEach(commande -> {
            if (commande.getOrderItems() != null) {
                commande.getOrderItems().forEach(item -> {
                    try {
                        Product product = productRestClient.getProductById(item.getProductId());
                        item.setProduct(product);
                    } catch (Exception e) {
                        // Ignore
                    }
                });
            }
        });
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth -> auth.equals("ROLE_ADMIN"));
    }

    private String getUserId(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            Object preferred = jwtAuth.getToken().getClaims().get("preferred_username");
            if (preferred != null) {
                return preferred.toString();
            }
            return jwtAuth.getName();
        }
        return authentication != null ? authentication.getName() : "unknown";
    }
}
