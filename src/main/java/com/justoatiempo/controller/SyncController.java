package com.justoatiempo.controller;
 
import com.justoatiempo.model.Proyecto;
import com.justoatiempo.model.Gasto;
import com.justoatiempo.model.Asistencia;
import com.justoatiempo.model.Empleado;
import com.justoatiempo.repository.ProyectoRepository;
import com.justoatiempo.repository.GastoRepository;
import com.justoatiempo.repository.AsistenciaRepository;
import com.justoatiempo.repository.EmpleadoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
 
import java.util.HashMap;
import java.util.List;
import java.util.Map;
 
@RestController
@RequestMapping("/api/sync")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080", "https://justo-a-tiempo-backend-production.up.railway.app"})
public class SyncController {
 
    @Autowired
    private ProyectoRepository proyectoRepository;
 
    @Autowired
    private GastoRepository gastoRepository;
 
    @Autowired
    private AsistenciaRepository asistenciaRepository;
 
    @Autowired
    private EmpleadoRepository empleadoRepository;
 
    @PostMapping
    public ResponseEntity<?> sincronizar(@RequestBody SyncPayload payload) {
        try {
            System.out.println("[SYNC] Iniciando sincronización de datos...");
 
            // Guardar proyectos
            if (payload.getProyectos() != null && !payload.getProyectos().isEmpty()) {
                for (Proyecto p : payload.getProyectos()) {
                    proyectoRepository.save(p);
                }
                System.out.println("[SYNC] Proyectos guardados: " + payload.getProyectos().size());
            }
 
            // Guardar gastos
            if (payload.getGastos() != null && !payload.getGastos().isEmpty()) {
                for (Gasto g : payload.getGastos()) {
                    gastoRepository.save(g);
                }
                System.out.println("[SYNC] Gastos guardados: " + payload.getGastos().size());
            }
 
            // Guardar asistencia
            if (payload.getAsistencia() != null && !payload.getAsistencia().isEmpty()) {
                for (Asistencia a : payload.getAsistencia()) {
                    asistenciaRepository.save(a);
                }
                System.out.println("[SYNC] Asistencias guardadas: " + payload.getAsistencia().size());
            }
 
            // Guardar empleados
            if (payload.getEmpleados() != null && !payload.getEmpleados().isEmpty()) {
                for (Empleado e : payload.getEmpleados()) {
                    empleadoRepository.save(e);
                }
                System.out.println("[SYNC] Empleados guardados: " + payload.getEmpleados().size());
            }
 
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("mensaje", "Sincronización exitosa");
            response.put("timestamp", System.currentTimeMillis());
 
            return ResponseEntity.ok(response);
 
        } catch (Exception e) {
            System.err.println("[SYNC] Error en sincronización: " + e.getMessage());
            e.printStackTrace();
 
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());
 
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
