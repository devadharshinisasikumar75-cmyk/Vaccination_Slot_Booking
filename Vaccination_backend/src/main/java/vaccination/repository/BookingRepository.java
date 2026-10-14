package vaccination.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import vaccination.model.Booking;
import vaccination.model.User;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    List<Booking> findByUser(User user);

    List<Booking> findAllByOrderByIdDesc();
}