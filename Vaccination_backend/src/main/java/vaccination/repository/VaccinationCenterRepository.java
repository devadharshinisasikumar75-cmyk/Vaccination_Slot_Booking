package vaccination.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vaccination.model.VaccinationCenter;

public interface VaccinationCenterRepository extends JpaRepository<VaccinationCenter, Long> {
    boolean existsByCenterNameIgnoreCase(String centerName);
}