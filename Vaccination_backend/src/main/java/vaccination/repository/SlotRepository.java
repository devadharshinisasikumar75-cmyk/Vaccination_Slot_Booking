package vaccination.repository;

import java.util.List;
import org.springframework.data.repository.CrudRepository;
import vaccination.model.Slot;

public interface SlotRepository extends CrudRepository<Slot, Long> {
    List<Slot> findByCenter(String center);
    List<Slot> findByDate(String date);
    List<Slot> findByCenterAndDate(String center, String date);
    boolean existsByCenterAndDateAndTime(String center, String date, String time);
    boolean existsByCenterAndDateAndVaccineIgnoreCaseAndStartTime(
            String center, String date, String vaccine, String startTime);
}
