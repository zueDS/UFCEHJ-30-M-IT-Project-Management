package com.hms.controller;

import com.hms.entity.Appointment;
import com.hms.service.AppointmentService;
import com.hms.service.impl.AppointmentServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:5173")
public class AppointmentController {

    @Autowired
    private AppointmentService service;

    @GetMapping
    public List<Appointment> getAll() {
        return service.getAll();
    }

    // Combined Save/Update endpoint
    @PostMapping
    public ResponseEntity<Appointment> saveAppointment(@RequestBody Appointment appointment) {
        return ResponseEntity.ok(service.saveOrUpdate(appointment));
    }

    // Update specific record using NIC in URL
    @PutMapping("/{nic}")
    public ResponseEntity<Appointment> updateByNic(@PathVariable String nic, @RequestBody Appointment appointment) {
        appointment.setNic(nic); // Ensure the NIC matches the URL
        return ResponseEntity.ok(service.saveOrUpdate(appointment));
    }

    @PatchMapping("/{nic}/cancel")
    public ResponseEntity<Void> cancelAppointment(@PathVariable String nic) {
        service.cancelByNic(nic);
        return ResponseEntity.ok().build();
    }
}
