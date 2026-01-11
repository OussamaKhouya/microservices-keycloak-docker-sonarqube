package com.tp.orderservice;

import com.tp.orderservice.entities.Order;
import com.tp.orderservice.entities.OrderItem;
import com.tp.orderservice.enums.OrderStatus;
import com.tp.orderservice.services.OrderService;
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
public class OrderServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrderServiceApplication.class, args);
	}

	// CommandLineRunner commented out because it requires authenticated context
	// to call the secured product-service. Uncomment if needed for testing.
	/*
	 * @Bean
	 * CommandLineRunner commandLineRunner(OrderService commandeService) {
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
	 * Order c1 = Order.builder()
	 * .orderDate(LocalDateTime.now())
	 * .status(OrderStatus.CREATED)
	 * .totalAmount(3200.00)
	 * .orderItems(List.of(item1, item2))
	 * .build();
	 * 
	 * commandeService.createOrder(c1);
	 * 
	 * OrderItem item3 = OrderItem.builder()
	 * .productId(1L)
	 * .quantity(1)
	 * .price(1200.00)
	 * .build();
	 * 
	 * Order c2 = Order.builder()
	 * .orderDate(LocalDateTime.now().minusDays(1))
	 * .status(OrderStatus.CONFIRMED)
	 * .totalAmount(1200.00)
	 * .orderItems(List.of(item3))
	 * .build();
	 * 
	 * commandeService.createOrder(c2);
	 * };
	 * }
	 */
}
