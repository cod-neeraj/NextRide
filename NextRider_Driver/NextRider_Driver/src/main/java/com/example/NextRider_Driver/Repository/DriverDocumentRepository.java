package com.example.NextRider_Driver.Repository;

import com.example.NextRider_Driver.Models.Entity.DriverDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface DriverDocumentRepository extends JpaRepository<DriverDocument, UUID> {
}
