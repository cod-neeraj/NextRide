package com.example.NextRide_User.DTO.Request;

import jakarta.persistence.Column;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class PasswordChange {

    @Column(nullable = false)
    private String currentPassword;
    @Column(nullable = false)
    private String newPassword;
}
