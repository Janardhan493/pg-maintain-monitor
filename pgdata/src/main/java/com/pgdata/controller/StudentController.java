package com.pgdata.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pgdata.model.Student;
import com.pgdata.repository.StudentRepository;

import java.util.List;

@RestController
@RequestMapping("/students")
@CrossOrigin(origins = "*")  // Allow requests from frontend
public class StudentController {

    @Autowired
    private StudentRepository studentRepo;

    // ➕ Add Student
    @PostMapping("/add")
    public Student addStudent(@RequestBody Student student) {
        return studentRepo.save(student);
    }

    // 📃 Get All Students
    @GetMapping("/students")
    public List<Student> getAllStudents() {
        return studentRepo.findAll();
    }

    // ❌ Delete Student
    @DeleteMapping("/delete/{id}")
    public void deleteStudent(@PathVariable Long id) {
        studentRepo.deleteById(id);
    }
    
    @PutMapping("/update/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student newStudent) {
        return studentRepo.findById(id).map(student -> {
            student.setName(newStudent.getName());
            student.setRoomNumber(newStudent.getRoomNumber());
            student.setMobileNumber(newStudent.getMobileNumber());
            student.setFeeAmount(newStudent.getFeeAmount());
            student.setFeePaid(newStudent.isFeePaid());
            studentRepo.save(student);
            return ResponseEntity.ok(student);
        }).orElse(ResponseEntity.notFound().build());
    }

    
}
