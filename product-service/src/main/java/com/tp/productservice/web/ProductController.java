package com.tp.productservice.web;

import com.tp.productservice.entities.Product;
import com.tp.productservice.services.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    private ProductService productService;
    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public List<Product> getAllProducts(){
        return productService.getAllProducts();
    }

    @GetMapping("/id")
    public Product getProductById(@RequestParam Long id){
        return productService.getProductById(id);
    }

    @PostMapping
    public Product createProduct(@RequestBody Product product){
        return productService.createProduct(product);
    }

    @PutMapping("/id")
    public Product updateProduct(@RequestParam Long id,
                                 @RequestBody Product productDetails) {
        return productService.updateProduct(id, productDetails);
    }

    @DeleteMapping("/id")
    public void deleteProductById(@RequestParam Long id) {
        productService.deleteProductById(id);
    }

}
