package com.tp.orderservice.web;

import com.tp.orderservice.entities.Order;
import com.tp.orderservice.services.OrderService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public List<Order> getAllOrders(Authentication authentication) {
        return orderService.getAllOrders(authentication);
    }

    @GetMapping("/{id}")
    public Order getOrderById(@PathVariable Long id, Authentication authentication) {
        return orderService.getOrderById(id, authentication);
    }

    @PostMapping
    public Order createOrder(@RequestBody Order order, Authentication authentication) {
        return orderService.createOrder(order, authentication);
    }

    @PutMapping("/{id}")
    public Order updateOrder(@PathVariable Long id,
                                   @RequestBody Order orderDetails) {
        return orderService.updateOrder(id, orderDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteOrderById(@PathVariable Long id) {
        orderService.deleteOrderById(id);
    }
}
