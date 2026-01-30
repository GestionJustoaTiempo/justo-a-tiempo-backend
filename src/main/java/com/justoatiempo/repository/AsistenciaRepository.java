package com.justoatiempo.repository;

import com.justoatiempo.model.Asistencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface AsistenciaRepository extends JpaRepository<Asistencia, Long> {
    List<Asistencia> findByNombreEmpleado(String nombreEmpleado);
    List<Asistencia> findByFecha(LocalDate fecha);
    List<Asistencia> findByFechaBetween(LocalDate inicio, LocalDate fin);
    List<Asistencia> findByEstado(String estado);
}
