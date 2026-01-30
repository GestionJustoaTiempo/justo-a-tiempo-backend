package com.justoatiempo.controller;

import com.justoatiempo.model.Usuario;
import com.justoatiempo.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:5173",
        "https://gestionjustoatiempo.com",
        "https://justo-a-tiempo-backend-production.up.railway.app"
})
public class AuthController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Usuario loginRequest) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(loginRequest.getEmail());

        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(401).body("Credenciales inválidas");
        }

        Usuario usuario = usuarioOpt.get();

        // Aquí estás comparando texto plano; si después usas BCrypt, se cambia esta parte
        if (!usuario.getPassword().equals(loginRequest.getPassword())) {
            return ResponseEntity.status(401).body("Credenciales inválidas");
        }

        // Devolver un objeto simple con mensaje y algún token o id si quieres
        return ResponseEntity.ok("Login exitoso");
    }
}
