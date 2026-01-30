package com.justoatiempo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {"com.justoatiempo"})
public class JustoATiempoApplication {

    public static void main(String[] args) {
        SpringApplication.run(JustoATiempoApplication.class, args);
    }
}
