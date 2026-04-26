package com.example.NextRider_Driver.Service;

import com.example.NextRider_Driver.Models.Entity.DriverProfile;
import com.example.NextRider_Driver.Models.Enums.DriverStatus;
import com.example.NextRider_Driver.Repository.DriverProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverBasicService implements UserDetailsService {
    private final DriverProfileRepository driverProfileRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        DriverProfile driver = driverProfileRepository.findByPhoneNumber(username)
                .orElseThrow(() -> new UsernameNotFoundException("Driver not found: " + username));

        return org.springframework.security.core.userdetails.User.builder()
                .username(driver.getPhoneNumber())
                .password(driver.getPassword())
                .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + driver.getRole())))
                .disabled(driver.getStatus() == DriverStatus.BLOCKED)
                .build();
    }
}
