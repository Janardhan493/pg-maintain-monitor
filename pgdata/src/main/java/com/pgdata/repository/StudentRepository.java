package com.pgdata.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.pgdata.model.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {
	
}

