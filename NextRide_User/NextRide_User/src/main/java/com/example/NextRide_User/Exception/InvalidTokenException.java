package com.example.NextRide_User.Exception;

public class InvalidTokenException extends RuntimeException{
    public InvalidTokenException (String message){
        super(message);
    }
}
