package com.hms.controller;

import com.hms.dto.DoctorDTO;
import com.hms.entity.Doctor;
import com.hms.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class DoctorController {

    private final DoctorService service;

    @PostMapping
    public Doctor create(@RequestBody DoctorDTO dto) {
        return service.create(dto);
    }

    @GetMapping
    public List<Doctor> getAll() {
        return service.getAll();
    }

    @GetMapping("/{mobile}")
    public Doctor getByMobile(@PathVariable String mobile) {
        return service.getByMobile(mobile);
    }

    @PutMapping("/{mobile}")
    public Doctor update(@PathVariable String mobile, @RequestBody DoctorDTO dto) {
        return service.update(mobile, dto);
    }

    @DeleteMapping("/{mobile}")
    public void delete(@PathVariable String mobile) {
        service.delete(mobile);
    }
}