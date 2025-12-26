package com.tp.productservice.services;

import com.tp.productservice.entities.Product;
import com.tp.productservice.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {
    private ProductRepository productRepository;
    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id).orElse(null);
        if (product != null) {
            product.setName(productDetails.getName());
            product.setDescription(productDetails.getDescription());
            product.setPrice(productDetails.getPrice());
            return productRepository.save(product);
        }
        return null;

    }

    public void deleteProductById(Long id) {
        productRepository.deleteById(id);
    }
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

}
