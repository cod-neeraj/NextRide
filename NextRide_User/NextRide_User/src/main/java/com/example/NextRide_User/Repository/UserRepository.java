package com.example.NextRide_User.Repository;

import com.example.NextRide_User.Models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByPhone(String phoneNumber);
    Boolean  existsByEmail(String email);
    Boolean existsByPhone(String phoneNumber);
}
