package com.justoatiempo.repository;

import com.justoatiempo.model.Proyecto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProyectoRepository extends JpaRepository<Proyecto, Long> {
    List<Proyecto> findByEstadoAprobacion(String estado);
    List<Proyecto> findByPago100(String pago100);
}
