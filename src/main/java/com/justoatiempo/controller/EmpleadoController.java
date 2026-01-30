package com.justoatiempo.controller;

import com.justoatiempo.model.Empleado;
import com.justoatiempo.repository.EmpleadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/empleados")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:5173",
        "https://gestionjustoatiempo.com",
        "https://justo-a-tiempo-backend-production.up.railway.app"
})
public class EmpleadoController {

    @Autowired
    private EmpleadoRepository empleadoRepository;

    @GetMapping
    public ResponseEntity<List<Empleado>> obtenerTodos() {
        List<Empleado> lista = empleadoRepository.findAll();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Empleado> obtenerPorId(@PathVariable Long id) {
        Optional<Empleado> empleado = empleadoRepository.findById(id);
        if (empleado.isPresent()) {
            return ResponseEntity.ok(empleado.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Empleado> crear(@RequestBody Empleado empleado) {
        Empleado guardado = empleadoRepository.save(empleado);
        return ResponseEntity.ok(guardado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Empleado> actualizar(@PathVariable Long id,
                                               @RequestBody Empleado empleado) {
        Optional<Empleado> existente = empleadoRepository.findById(id);
        if (existente.isPresent()) {
            empleado.setId(id);
            Empleado actualizado = empleadoRepository.save(empleado);
            return ResponseEntity.ok(actualizado);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminar(@PathVariable Long id) {
        Optional<Empleado> empleado = empleadoRepository.findById(id);
        if (empleado.isPresent()) {
            empleadoRepository.deleteById(id);
            return ResponseEntity.ok("Empleado eliminado");
        }
        return ResponseEntity.notFound().build();
    }
}
