package com.example.NextRider_Driver.Exception;

public class AccountSuspendedException extends RuntimeException{
    public AccountSuspendedException(String message){
        super(message);
    }
}
