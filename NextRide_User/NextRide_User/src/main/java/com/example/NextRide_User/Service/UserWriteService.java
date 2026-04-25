package com.example.NextRide_User.Service;
import com.example.NextRide_User.DTO.Request.PasswordChange;
import com.example.NextRide_User.DTO.Request.UpdateProfile;
import com.example.NextRide_User.DTO.Request.UserLogin;
import com.example.NextRide_User.DTO.Request.UserRegister;
import com.example.NextRide_User.DTO.Response.AuthResponse;
import com.example.NextRide_User.DTO.Response.UserResponse;
import com.example.NextRide_User.Exception.EmailAlreadyExistsException;
import com.example.NextRide_User.Exception.InvalidCredentialsException;
import com.example.NextRide_User.Exception.PhoneAlreadyExistsException;
import com.example.NextRide_User.Exception.UserNotExistException;
import com.example.NextRide_User.Mapper.UserMapper;
import com.example.NextRide_User.Models.User;
import com.example.NextRide_User.Models.UserStatus;
import com.example.NextRide_User.Repository.UserRepository;
import com.example.NextRide_User.Security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.hibernate.sql.Update;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.types.Expirations;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserWriteService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;


    public AuthResponse registerUser(UserRegister userRegister) {

        if (userRepository.existsByEmail(userRegister.getEmail())) {
            throw new EmailAlreadyExistsException(
                    "Email already registered: " + userRegister.getEmail()
            );
        }
        if (userRepository.existsByPhone(userRegister.getPhone())) {
            throw new PhoneAlreadyExistsException(
                    "Phone already registered" + userRegister.getPhone()
            );
        }
        User user = userMapper.toEntity(userRegister);
        user.setPasswordHash(
                passwordEncoder.encode(userRegister.getPassword())
        );
        user.setStatus(UserStatus.ACTIVE);
        User saved = userRepository.save(user);
        String accessToken  = jwtUtil.generateToken(saved);
        String refreshToken = jwtUtil.generateRefreshToken(saved);
        refreshTokenService.storeRefreshToken(saved.getId(), refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(86400L)
                .userResponse(userMapper.toResponse(saved))
                .build();
    }
    public AuthResponse login(UserLogin request) {

        User user = userRepository.findByPhone(request.getPhone())
                .orElseThrow(() -> new InvalidCredentialsException(
                        "Invalid Phone or password"
                ));

//        // 2. Check account status
//        if (user.getStatus() == UserStatus.SUSPENDED) {
//            throw new AccountSuspendedException(
//                    "Your account is suspended. Contact support."
//            );
//        }

        if (user.getStatus() == UserStatus.DELETED) {
            throw new InvalidCredentialsException(
                    "Invalid email or password"
            );
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException(
                    "Invalid email or password"
            );
        }

        String accessToken  = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);
        refreshTokenService.storeRefreshToken(user.getId(), refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(900L)
                .userResponse(userMapper.toResponse(user))
                .build();
    }
    public UserResponse updateProfile(UpdateProfile updateProfile , String phone){
        User user = userRepository.findByPhone(phone)
                .orElseThrow(()-> new UserNotExistException(" User not exist"));
        if(updateProfile.getKey().equalsIgnoreCase("fullname")){
            user.setFullName(updateProfile.getValue());
        }else{
            user.setPhone(updateProfile.getValue());
        }
        userRepository.save(user);
        return userMapper.toResponse(user);
    }
    public void changePassword(String phoneNumber, PasswordChange passwordChange){
        User user = userRepository.findByPhone(phoneNumber)
                .orElseThrow(()-> new UserNotExistException(" User not exist"));
        if(!passwordEncoder.matches(passwordChange.getCurrentPassword(),
                user.getPasswordHash())) {
            throw new InvalidCredentialsException("Current password is wrong");
        }
        user.setPasswordHash(passwordEncoder.encode(passwordChange.getNewPassword()));
        userRepository.save(user);
    }
    public void softDeleteUser(String phoneNumber){
        User user = userRepository.findByPhone(phoneNumber)
                .orElseThrow(()-> new UserNotExistException(" User not exist"));
        user.setStatus(UserStatus.DELETED);
        refreshTokenService.deleteRefreshToken(user.getId());
        userRepository.save(user);
    }
}
