package com.example.NextRide_User.Response;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class ApiResponse<T> {

    private boolean success;
    private String message;
    private T data;

}