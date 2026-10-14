package vaccination.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import vaccination.model.Vaccine;

public interface VaccineRepository extends JpaRepository<Vaccine, Long> {
    boolean existsByVaccineNameIgnoreCase(String vaccineName);
    Optional<Vaccine> findByVaccineNameIgnoreCase(String vaccineName);
}
