package com.justoatiempo.controller;

import com.justoatiempo.model.Gasto;
import com.justoatiempo.repository.GastoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/gastos")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:5173",
        "https://gestionjustoatiempo.com",
        "https://justo-a-tiempo-backend-production.up.railway.app"
})
public class GastoController {

    @Autowired
    private GastoRepository gastoRepository;

    @GetMapping
    public ResponseEntity<List<Gasto>> obtenerTodos() {
        List<Gasto> lista = gastoRepository.findAll();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Gasto> obtenerPorId(@PathVariable Long id) {
        Optional<Gasto> gasto = gastoRepository.findById(id);
        if (gasto.isPresent()) {
            return ResponseEntity.ok(gasto.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Gasto> crear(@RequestBody Gasto gasto) {
        Gasto guardado = gastoRepository.save(gasto);
        return ResponseEntity.ok(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Gasto> actualizar(@PathVariable Long id,
                                            @RequestBody Gasto gasto) {
        Optional<Gasto> existente = gastoRepository.findById(id);
        if (existente.isPresent()) {
            gasto.setId(id);
            Gasto actualizado = gastoRepository.save(gasto);
            return ResponseEntity.ok(actualizado);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminar(@PathVariable Long id) {
        Optional<Gasto> gasto = gastoRepository.findById(id);
        if (gasto.isPresent()) {
            gastoRepository.deleteById(id);
            return ResponseEntity.ok("Gasto eliminado");
        }
        return ResponseEntity.notFound().build();
    }
}
