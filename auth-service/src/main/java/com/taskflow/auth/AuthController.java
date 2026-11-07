package com.taskflow.auth;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api/auth")
public class AuthController {
  private final UserRepository users; private final JwtService jwt;
  private final BCryptPasswordEncoder encoder=new BCryptPasswordEncoder();
  public AuthController(UserRepository users,JwtService jwt){this.users=users;this.jwt=jwt;}

  public record RegisterRequest(@NotBlank String name,@Email @NotBlank String email,
                                @Size(min=8) String password) {}
  public record LoginRequest(@Email @NotBlank String email,@NotBlank String password) {}

  @PostMapping("/register")
  public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
    if(users.existsByEmail(req.email().toLowerCase()))
      return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error","Email already registered"));
    User user=users.save(new User(req.name(),req.email().toLowerCase(),encoder.encode(req.password())));
    return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("id",user.getId(),"name",user.getName(),"email",user.getEmail()));
  }
  @PostMapping("/login")
  public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
    var user=users.findByEmail(req.email().toLowerCase()).orElse(null);
    if(user==null || !encoder.matches(req.password(),user.getPassword()))
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error","Invalid email or password"));
    return ResponseEntity.ok(Map.of("token",jwt.generate(user),"tokenType","Bearer",
      "user",Map.of("id",user.getId(),"name",user.getName(),"email",user.getEmail())));
  }
}
