package com.justoatiempo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "proyectos")
public class Proyecto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String empresa;
    
    @Column(nullable = false)
    private String ordenCompra;
    
    @Column(nullable = false)
    private String proyecto;
    
    @Column(nullable = false)
    private Double presupuesto;
    
    @Column(nullable = false)
    private String iva;
    
    @Column(nullable = false)
    private Double montoIVA;
    
    @Column(nullable = false)
    private Double totalFinal;
    
    @Column(nullable = false)
    private String estadoAprobacion;
    
    @Column(nullable = false)
    private String pago50;
    
    private Double montoRecibido50;
    private Double monto50Debe;
    private Double faltaRecibir50;
    private LocalDate fecha50;
    private String pago100;
    private LocalDate fecha100;
    private String factura;
    private String facturaFinal;
    private Double montoFacturaFinal;
    private LocalDate fechaEntrega;
    private String estadoSaldo30;
    private Double saldoPorCobrar;
    
    @Column(columnDefinition = "TEXT")
    private String notas;
    
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDate fechaCreacion = LocalDate.now();
    
    @Column(name = "fecha_actualizacion")
    private LocalDate fechaActualizacion = LocalDate.now();
}
