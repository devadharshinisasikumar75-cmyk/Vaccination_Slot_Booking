package vaccination.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import vaccination.model.Booking;
import vaccination.repository.BookingRepository;

@RestController
public class HealthcareController {
    private final BookingRepository bookingRepository;

    public HealthcareController(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    @GetMapping({"/api/healthcare/appointments", "/api/reports/healthcare"})
    public List<Map<String, Object>> getHealthcareAppointments() {
        return bookingRepository.findAllByOrderByIdDesc()
                .stream()
                .map(this::toAppointmentMap)
                .toList();
    }

    private Map<String, Object> toAppointmentMap(Booking booking) {
        Map<String, Object> appointment = new HashMap<>();
        appointment.put("id", booking.getId());
        appointment.put("center", valueOrDash(booking.getCenter()));
        appointment.put("vaccine", valueOrDash(booking.getVaccine()));
        appointment.put("bookingDate", valueOrDash(booking.getBookingDate()));
        appointment.put("bookingTime", valueOrDash(booking.getBookingTime()));
        appointment.put("date", valueOrDash(booking.getBookingDate()));
        appointment.put("time", valueOrDash(booking.getBookingTime()));
        appointment.put("status", booking.getStatus() == null ? "PENDING" : booking.getStatus());

        if (booking.getUser() == null) {
            appointment.put("userId", null);
            appointment.put("userName", "User");
            appointment.put("userEmail", "-");
        } else {
            appointment.put("userId", booking.getUser().getId());
            appointment.put("userName", valueOrDash(booking.getUser().getName()));
            appointment.put("userEmail", valueOrDash(booking.getUser().getEmail()));
        }
        return appointment;
    }

    private String valueOrDash(String value) {
        return value == null || value.isBlank() ? "-" : value;
    }
}
