package com.taskflow.task;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
@Component
public class JwtAuthFilter extends OncePerRequestFilter {
  private final SecretKey key;
  public JwtAuthFilter(@Value("${app.jwt.secret}") String secret){
    key=Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
  }
  @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)
      throws ServletException,IOException {
    String header=req.getHeader("Authorization");
    if(header!=null && header.startsWith("Bearer ")) {
      try {
        String userId=Jwts.parser().verifyWith(key).build().parseSignedClaims(header.substring(7))
          .getPayload().getSubject();
        req.setAttribute("userId",Long.valueOf(userId));
      } catch(Exception ex) {
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED); res.setContentType("application/json");
        res.getWriter().write("{\"error\":\"Invalid or expired token\"}"); return;
      }
    }
    chain.doFilter(req,res);
  }
}
