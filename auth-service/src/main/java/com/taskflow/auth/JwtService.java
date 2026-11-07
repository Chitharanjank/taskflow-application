package com.taskflow.auth;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.nio.charset.StandardCharsets;
import java.util.Date;
@Service
public class JwtService {
  private final SecretKey key; private final long expiration;
  public JwtService(@Value("${app.jwt.secret}") String secret,
                    @Value("${app.jwt.expiration-ms}") long expiration) {
    this.key=Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)); this.expiration=expiration;
  }
  public String generate(User user) {
    long now=System.currentTimeMillis();
    return Jwts.builder().subject(user.getId().toString()).claim("email",user.getEmail())
      .issuedAt(new Date(now)).expiration(new Date(now+expiration)).signWith(key).compact();
  }
}
