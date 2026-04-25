package com.example.NextRide_User.Service;

import com.example.NextRide_User.DTO.Response.UserResponse;
import com.example.NextRide_User.Exception.UserNotExistException;
import com.example.NextRide_User.Mapper.UserMapper;
import com.example.NextRide_User.Models.User;
import com.example.NextRide_User.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserReadService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @PreAuthorize("hasRole('RIDER')")
    public UserResponse me(String phone){
        User user = userRepository.findByPhone(phone)
                .orElseThrow(()-> new UserNotExistException(" User not exist"));

        return userMapper.toResponse(user);
    }
}
