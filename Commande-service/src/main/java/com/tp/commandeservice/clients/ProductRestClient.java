package com.tp.commandeservice.clients;

import com.tp.commandeservice.config.FeignSecurityConfig;
import com.tp.commandeservice.model.Product;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "product-service",
        url = "${PRODUCT_SERVICE_URL:http://product-service:8081}",
        configuration = FeignSecurityConfig.class
)
public interface ProductRestClient {
    @GetMapping("/api/products/{id}")
    Product getProductById(@PathVariable("id") Long id);
}
