package com.example.NextRide_Ride.Exception;

public class AccountSuspendedException extends RuntimeException{
    public AccountSuspendedException(String message){
        super(message);
    }
}
