package com.example.NextRide_User.DTO.Request;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UpdateProfile {

    private String key;
    private String value;
}
