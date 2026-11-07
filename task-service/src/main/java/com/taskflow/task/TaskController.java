package com.taskflow.task;
import org.springframework.web.server.ResponseStatusException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/api/tasks")
public class TaskController {
  private final TaskRepository tasks;
  public TaskController(TaskRepository tasks){this.tasks=tasks;}
  public record TaskRequest(@NotBlank @Size(max=200) String title,
    @Size(max=3000) String description,Task.Priority priority,Task.Status status){}
  private Long userId(HttpServletRequest req){
    Object id=req.getAttribute("userId"); if(id==null)throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,"Bearer token required");
    return (Long)id;
  }
  @PostMapping public ResponseEntity<?> create(@Valid @RequestBody TaskRequest body,HttpServletRequest req){
    Task saved=tasks.save(new Task(userId(req),body.title(),body.description(),body.priority(),body.status()));
    return ResponseEntity.status(HttpStatus.CREATED).body(saved);
  }
  @GetMapping public Object list(HttpServletRequest req){return tasks.findAllByOwnerIdOrderByCreatedAtDesc(userId(req));}
  @GetMapping("/{id}") public Object get(@PathVariable Long id,HttpServletRequest req){
    return tasks.findByIdAndOwnerId(id,userId(req)).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
  }
  @PutMapping("/{id}") public Object update(@PathVariable Long id,@Valid @RequestBody TaskRequest body,HttpServletRequest req){
    Task task=tasks.findByIdAndOwnerId(id,userId(req)).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
    task.update(body.title(),body.description(),body.priority(),body.status());return tasks.save(task);
  }
  @DeleteMapping("/{id}") public ResponseEntity<?> delete(@PathVariable Long id,HttpServletRequest req){
    Task task=tasks.findByIdAndOwnerId(id,userId(req)).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND));
    tasks.delete(task);return ResponseEntity.noContent().build();
  }
}
