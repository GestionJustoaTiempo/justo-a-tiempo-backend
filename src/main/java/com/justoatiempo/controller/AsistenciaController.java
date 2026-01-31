package com.justoatiempo.controller;

import com.justoatiempo.model.Asistencia;
import com.justoatiempo.repository.AsistenciaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/asistencia")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:5173",
        "https://gestionjustoatiempo.com",
        "https://justo-a-tiempo-backend-production.up.railway.app"
})
public class AsistenciaController {

    @Autowired
    private AsistenciaRepository asistenciaRepository;

    @GetMapping
    public ResponseEntity<List<Asistencia>> obtenerTodas() {
        List<Asistencia> lista = asistenciaRepository.findAll();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Asistencia> obtenerPorId(@PathVariable Long id) {
        Optional<Asistencia> asistencia = asistenciaRepository.findById(id);
        if (asistencia.isPresent()) {
            return ResponseEntity.ok(asistencia.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<Asistencia> crear(@RequestBody Asistencia asistencia) {
        Asistencia asistenciaGuardada = asistenciaRepository.save(asistencia);
        return ResponseEntity.ok(asistenciaGuardada);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Asistencia> actualizar(@PathVariable Long id,
                                                 @RequestBody Asistencia asistencia) {
        Optional<Asistencia> existente = asistenciaRepository.findById(id);
        if (existente.isPresent()) {
            asistencia.setId(id);
            Asistencia actualizada = asistenciaRepository.save(asistencia);
            return ResponseEntity.ok(actualizada);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> eliminar(@PathVariable Long id) {
        Optional<Asistencia> asistencia = asistenciaRepository.findById(id);
        if (asistencia.isPresent()) {
            asistenciaRepository.deleteById(id);
            return ResponseEntity.ok("Asistencia eliminada");
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/empleado/{nombre}")
    public ResponseEntity<List<Asistencia>> obtenerPorEmpleado(@PathVariable String nombre) {
        List<Asistencia> lista = asistenciaRepository.findByNombreEmpleado(nombre);
        return ResponseEntity.ok(lista);
    }
}
