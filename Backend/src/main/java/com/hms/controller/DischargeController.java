package com.hms.controller;

import com.hms.entity.Discharge;
import com.hms.service.DischargeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discharge")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DischargeController {
    private final DischargeService service;

    @PostMapping
    public Discharge discharge(@RequestBody Discharge discharge) {
        return service.dischargePatient(discharge);
    }

    @GetMapping
    public List<Discharge> getHistory() {
        return service.getAllHistory();
    }
}
