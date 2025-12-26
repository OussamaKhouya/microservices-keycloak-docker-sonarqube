package com.tp.productservice;

import com.tp.productservice.entities.Product;
import com.tp.productservice.services.ProductService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.List;

@SpringBootApplication
public class ProductServiceApplication {

    public ProductServiceApplication(ProductService productService) {
        this.productService = productService;
    }

    public static void main(String[] args) {
        SpringApplication.run(ProductServiceApplication.class, args);
    }

    private final ProductService productService;

    @Bean
    CommandLineRunner commandLineRunner() {
        return args -> {
            List<Product> products = List.of(
                    Product.builder()
                            .name("Laptop")
                            .description("A high-performance laptop")
                            .price(1200.00)
                            .build(),
                    Product.builder()
                            .name("Smartphone")
                            .description("A latest model smartphone")
                            .price(800.00)
                            .build()
            );

            for (Product product : products) {
                productService.createProduct(product);
            }
        };
    }
}
