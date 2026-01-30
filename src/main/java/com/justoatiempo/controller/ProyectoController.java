package com.justoatiempo.controller;

import com.justoatiempo.model.Proyecto;
import com.justoatiempo.repository.ProyectoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/proyectos")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:5173",
        "https://gestionjustoatiempo.com",
        "https://justo-a-tiempo-backend-production.up.railway.app"
})
public class ProyectoController {

    @Autowired
    private ProyectoRepository proyectoRepository;

    @GetMapping
    public ResponseEntity<List<Proyecto>> obtenerTodos() {
        List<Proyecto> lista = proyectoRepository.findAll();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Proyecto> obtenerPorId(@PathVariable Long id) {
        Optional<Proyecto> proyecto = proyectoRepository.findById(id);
        if (proyecto.isPresent()) {
            return ResponseEntity.ok(proyecto.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Proyecto> crear(@RequestBody Proyecto proyecto) {
        Proyecto guardado = proyectoRepository.save(proyecto);
        return ResponseEntity.ok(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Proyecto> actualizar(@PathVariable Long id,
                                               @RequestBody Proyecto proyecto) {
        Optional<Proyecto> existente = proyectoRepository.findById(id);
        if (existente.isPresent()) {
            proyecto.setId(id);
            Proyecto actualizado = proyectoRepository.save(proyecto);
            return ResponseEntity.ok(actualizado);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminar(@PathVariable Long id) {
        Optional<Proyecto> proyecto = proyectoRepository.findById(id);
        if (proyecto.isPresent()) {
            proyectoRepository.deleteById(id);
            return ResponseEntity.ok("Proyecto eliminado");
        }
        return ResponseEntity.notFound().build();
    }
}
