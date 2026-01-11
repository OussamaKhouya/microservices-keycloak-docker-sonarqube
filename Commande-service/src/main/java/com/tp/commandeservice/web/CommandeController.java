package com.tp.commandeservice.web;

import com.tp.commandeservice.entities.Commande;
import com.tp.commandeservice.services.CommandeService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/commandes")
public class CommandeController {

    private final CommandeService commandeService;

    public CommandeController(CommandeService commandeService) {
        this.commandeService = commandeService;
    }

    @GetMapping
    public List<Commande> getAllCommandes(Authentication authentication) {
        return commandeService.getAllCommandes(authentication);
    }

    @GetMapping("/{id}")
    public Commande getCommandeById(@PathVariable Long id, Authentication authentication) {
        return commandeService.getCommandeById(id, authentication);
    }

    @PostMapping
    public Commande createCommande(@RequestBody Commande commande, Authentication authentication) {
        return commandeService.createCommande(commande, authentication);
    }

    @PutMapping("/{id}")
    public Commande updateCommande(@PathVariable Long id,
                                   @RequestBody Commande commandeDetails) {
        return commandeService.updateCommande(id, commandeDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteCommandeById(@PathVariable Long id) {
        commandeService.deleteCommandeById(id);
    }
}
