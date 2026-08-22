package com.example.NextRide_User.Exception;

import com.example.NextRide_User.Models.User;

public class UserNotExistException extends RuntimeException{
    public UserNotExistException(String message) {
        super(message);
    }
}
