package com.taskflow.task;
import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
@Configuration
public class SecurityConfig {
  @Bean SecurityFilterChain filterChain(HttpSecurity http,JwtAuthFilter jwt) throws Exception {
    return http.csrf(c->c.disable()).authorizeHttpRequests(a->a.anyRequest().permitAll())
      .addFilterBefore(jwt,UsernamePasswordAuthenticationFilter.class).build();
  }
}
