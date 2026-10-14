package vaccination.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import vaccination.model.VaccinationRecord;

public interface VaccinationRecordRepository extends JpaRepository<VaccinationRecord, Long> {
    Optional<VaccinationRecord> findByBookingId(Long bookingId);
}