package com.taskflow.task;
import jakarta.persistence.*;
import java.time.Instant;
@Entity @Table(name="tasks")
public class Task {
  public enum Status { TODO, IN_PROGRESS, DONE }
  public enum Priority { LOW, MEDIUM, HIGH }
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(nullable=false) private Long ownerId;
  @Column(nullable=false) private String title;
  @Column(length=3000) private String description;
  @Enumerated(EnumType.STRING) @Column(nullable=false) private Status status=Status.TODO;
  @Enumerated(EnumType.STRING) @Column(nullable=false) private Priority priority=Priority.MEDIUM;
  @Column(nullable=false) private Instant createdAt=Instant.now();
  private Instant updatedAt=Instant.now();
  protected Task(){}
  public Task(Long ownerId,String title,String description,Priority priority,Status status){
    this.ownerId=ownerId;this.title=title;this.description=description;
    if(priority!=null)this.priority=priority;if(status!=null)this.status=status;
  }
  public void update(String title,String description,Priority priority,Status status){
    this.title=title;this.description=description;if(priority!=null)this.priority=priority;
    if(status!=null)this.status=status;this.updatedAt=Instant.now();
  }
  public Long getId(){return id;} public Long getOwnerId(){return ownerId;}
  public String getTitle(){return title;} public String getDescription(){return description;}
  public Status getStatus(){return status;} public Priority getPriority(){return priority;}
  public Instant getCreatedAt(){return createdAt;} public Instant getUpdatedAt(){return updatedAt;}
}
