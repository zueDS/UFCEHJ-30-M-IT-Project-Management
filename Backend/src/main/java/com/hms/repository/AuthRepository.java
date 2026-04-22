package com.hms.repository;

import com.hms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AuthRepository extends JpaRepository<User, Integer> {

//    @Query(value = "SELECT DayTyp FROM monthcalender WHERE Dat = :date", nativeQuery = true)
//    String dayCheck(@Param("date") LocalDate date);

    Optional<User> findByEmailAndPassword(String mail, String password);

}
