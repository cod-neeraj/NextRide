package com.example.NextRide_User.Mapper;

import com.example.NextRide_User.DTO.Request.UserRegister;
import com.example.NextRide_User.DTO.Response.UserResponse;
import com.example.NextRide_User.Models.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

     User toEntity(UserRegister userRegister);
     UserResponse toResponse(User user);

}
