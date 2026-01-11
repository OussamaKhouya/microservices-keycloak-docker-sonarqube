package com.tp.commandeservice.entities;

import com.tp.commandeservice.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Commande {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime orderDate;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    private Double totalAmount;

    // Owner username (preferred_username from JWT)
    private String userId;

    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL)
    private List<OrderItem> orderItems;
}
