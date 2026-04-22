package com.hms.controller;

import com.hms.entity.User;
import com.hms.dto.request.AuthRequest;
import com.hms.service.AuthService;
import com.hms.util.Response;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/login")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private AuthService authService;


    @PostMapping("auth")
    public Response<?> authRequest(@RequestBody AuthRequest request) {
        return authService.Auth(request.getMail(), request.getPassword());
    }

    @PostMapping("register")
    public Response<?> registerRequest(@RequestBody User request) {
        return authService.Register(request);
    }

}
