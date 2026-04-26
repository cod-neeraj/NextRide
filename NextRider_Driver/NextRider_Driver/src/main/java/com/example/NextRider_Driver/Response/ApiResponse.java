package com.example.NextRider_Driver.Response;

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