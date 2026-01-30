package com.justoatiempo.repository;

import com.justoatiempo.model.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface GastoRepository extends JpaRepository<Gasto, Long> {
    List<Gasto> findByFechaBetween(LocalDate inicio, LocalDate fin);
    List<Gasto> findByTipo(String tipo);
    List<Gasto> findByProyecto(String proyecto);
}
