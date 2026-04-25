package com.example.NextRide_User.DTO.Request;

import jakarta.persistence.Column;
import lombok.*;
import org.hibernate.validator.constraints.pl.NIP;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserLogin {

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(nullable = false)
    private String password;
}
