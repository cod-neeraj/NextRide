package com.example.NextRide_User.Exception;

public class AccountSuspendedException extends RuntimeException{
    public AccountSuspendedException(String message){
        super(message);
    }
}
