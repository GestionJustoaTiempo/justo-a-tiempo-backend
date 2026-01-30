package com.justoatiempo.controller;
 
import com.justoatiempo.model.Proyecto;
import com.justoatiempo.model.Gasto;
import com.justoatiempo.model.Asistencia;
import com.justoatiempo.model.Empleado;
import java.util.List;
 
public class SyncPayload {
    private List<Proyecto> proyectos;
    private List<Gasto> gastos;
    private List<Asistencia> asistencia;
    private List<Empleado> empleados;
 
    // Constructores
    public SyncPayload() {
    }
 
    public SyncPayload(List<Proyecto> proyectos, List<Gasto> gastos, 
                       List<Asistencia> asistencia, List<Empleado> empleados) {
        this.proyectos = proyectos;
        this.gastos = gastos;
        this.asistencia = asistencia;
        this.empleados = empleados;
    }
 
    // Getters y Setters
    public List<Proyecto> getProyectos() {
        return proyectos;
    }
 
    public void setProyectos(List<Proyecto> proyectos) {
        this.proyectos = proyectos;
    }
 
    public List<Gasto> getGastos() {
        return gastos;
    }
 
    public void setGastos(List<Gasto> gastos) {
        this.gastos = gastos;
    }
 
    public List<Asistencia> getAsistencia() {
        return asistencia;
    }
 
    public void setAsistencia(List<Asistencia> asistencia) {
        this.asistencia = asistencia;
    }
 
    public List<Empleado> getEmpleados() {
        return empleados;
    }
 
    public void setEmpleados(List<Empleado> empleados) {
        this.empleados = empleados;
    }
}
