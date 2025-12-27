package com.tp.commandeservice.services;

import com.tp.commandeservice.clients.ProductRestClient;
import com.tp.commandeservice.entities.Commande;
import com.tp.commandeservice.entities.OrderItem;
import com.tp.commandeservice.model.Product;
import com.tp.commandeservice.repository.CommandeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class CommandeService {
    private final CommandeRepository commandeRepository;
    private final ProductRestClient productRestClient;

    public CommandeService(CommandeRepository commandeRepository, ProductRestClient productRestClient) {
        this.commandeRepository = commandeRepository;
        this.productRestClient = productRestClient;
    }

    public Commande getCommandeById(Long id) {
        Commande commande = commandeRepository.findById(id).orElse(null);
        if (commande != null && commande.getOrderItems() != null) {
            commande.getOrderItems().forEach(item -> {
                try {
                    Product product = productRestClient.getProductById(item.getProductId());
                    item.setProduct(product);
                } catch (Exception e) {
                    // Ignore if product not found or service down
                }
            });
        }
        return commande;
    }

    public Commande createCommande(Commande commande) {
        if (commande.getOrderDate() == null) {
            commande.setOrderDate(LocalDateTime.now());
        }

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

    public List<Commande> getAllCommandes() {
        List<Commande> commandes = commandeRepository.findAll();
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
        return commandes;
    }
}
