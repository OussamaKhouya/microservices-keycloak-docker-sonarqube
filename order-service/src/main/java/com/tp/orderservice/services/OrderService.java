package com.tp.orderservice.services;

import com.tp.orderservice.clients.ProductRestClient;
import com.tp.orderservice.entities.Order;
import com.tp.orderservice.entities.OrderItem;
import com.tp.orderservice.model.Product;
import com.tp.orderservice.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class OrderService {
    private final OrderRepository orderRepository;
    private final ProductRestClient productRestClient;

    public OrderService(OrderRepository orderRepository, ProductRestClient productRestClient) {
        this.orderRepository = orderRepository;
        this.productRestClient = productRestClient;
    }

    public Order getOrderById(Long id, Authentication authentication) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return null;
        }
        if (!isAdmin(authentication) && !order.getUserId().equals(getUserId(authentication))) {
            throw new AccessDeniedException("Not allowed to view this order");
        }
        enrichProducts(List.of(order));
        return order;
    }

    public Order createOrder(Order order, Authentication authentication) {
        if (order.getOrderDate() == null) {
            order.setOrderDate(LocalDateTime.now());
        }
        order.setUserId(getUserId(authentication));

        double total = 0.0;

        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
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
                item.setOrder(order);
            }
        }

        order.setTotalAmount(total);

        return orderRepository.save(order);
    }

    public Order updateOrder(Long id, Order orderDetails) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order != null) {
            order.setStatus(orderDetails.getStatus());
            order.setTotalAmount(orderDetails.getTotalAmount());
            return orderRepository.save(order);
        }
        return null;
    }

    public void deleteOrderById(Long id) {
        orderRepository.deleteById(id);
    }

    public List<Order> getAllOrders(Authentication authentication) {
        List<Order> orders = isAdmin(authentication)
                ? orderRepository.findAll()
                : orderRepository.findByUserId(getUserId(authentication));
        enrichProducts(orders);
        return orders;
    }

    private void enrichProducts(List<Order> orders) {
        orders.forEach(order -> {
            if (order.getOrderItems() != null) {
                order.getOrderItems().forEach(item -> {
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
