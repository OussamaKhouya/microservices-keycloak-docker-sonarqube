package com.tp.commandeservice;

import com.tp.commandeservice.entities.Commande;
import com.tp.commandeservice.entities.OrderItem;
import com.tp.commandeservice.enums.OrderStatus;
import com.tp.commandeservice.services.CommandeService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
@EnableDiscoveryClient
public class CommandeServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CommandeServiceApplication.class, args);
	}

	// CommandLineRunner commented out because it requires authenticated context
	// to call the secured product-service. Uncomment if needed for testing.
	/*
	 * @Bean
	 * CommandLineRunner commandLineRunner(CommandeService commandeService) {
	 * return args -> {
	 * 
	 * OrderItem item1 = OrderItem.builder()
	 * .productId(1L)
	 * .quantity(2)
	 * .price(1200.00)
	 * .build();
	 * 
	 * OrderItem item2 = OrderItem.builder()
	 * .productId(2L)
	 * .quantity(1)
	 * .price(800.00)
	 * .build();
	 * 
	 * Commande c1 = Commande.builder()
	 * .orderDate(LocalDateTime.now())
	 * .status(OrderStatus.CREATED)
	 * .totalAmount(3200.00)
	 * .orderItems(List.of(item1, item2))
	 * .build();
	 * 
	 * commandeService.createCommande(c1);
	 * 
	 * OrderItem item3 = OrderItem.builder()
	 * .productId(1L)
	 * .quantity(1)
	 * .price(1200.00)
	 * .build();
	 * 
	 * Commande c2 = Commande.builder()
	 * .orderDate(LocalDateTime.now().minusDays(1))
	 * .status(OrderStatus.CONFIRMED)
	 * .totalAmount(1200.00)
	 * .orderItems(List.of(item3))
	 * .build();
	 * 
	 * commandeService.createCommande(c2);
	 * };
	 * }
	 */
}
