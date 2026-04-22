package com.hms.service.impl;

import com.hms.entity.User;
import com.hms.repository.AuthRepository;
import com.hms.service.AuthService;
import com.hms.util.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {
    @Autowired
    private AuthRepository authRepository;

    @Override
    public Response<?> Auth(String mail, String password) {
        return new Response<>("success", "log", authRepository.findByEmailAndPassword(mail, password));
    }

    @Override
    public Response<?> Register(User user) {
        User save = authRepository.save(user);
        return new Response<>("success", "Registered", save);
    }
}
