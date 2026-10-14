package vaccination.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;

import vaccination.model.Booking;
import vaccination.model.User;
import vaccination.repository.BookingRepository;

class HealthcareControllerTest {
    @Test
    void returnsBookingsWithPatientAndAppointmentFieldsForDashboard() {
        BookingRepository repository = mock(BookingRepository.class);
        HealthcareController controller = new HealthcareController(repository);
        User patient = new User("Patient", "patient@example.test", "unused", "USER");
        setId(patient, 3L);
        Booking booking = new Booking(
                patient,
                "Kauvery Hospital",
                "BCG Vaccine",
                "2026-10-16",
                "11:00 AM - 03:00 PM");
        setId(booking, 1L);
        when(repository.findAllByOrderByIdDesc()).thenReturn(List.of(booking));

        List<Map<String, Object>> result = controller.getHealthcareAppointments();

        assertEquals(1, result.size());
        Map<String, Object> appointment = result.get(0);
        assertEquals(1L, appointment.get("id"));
        assertEquals(3L, appointment.get("userId"));
        assertEquals("Patient", appointment.get("userName"));
        assertEquals("patient@example.test", appointment.get("userEmail"));
        assertEquals("BCG Vaccine", appointment.get("vaccine"));
        assertEquals("2026-10-16", appointment.get("bookingDate"));
        assertEquals("11:00 AM - 03:00 PM", appointment.get("bookingTime"));
        assertEquals("Pending", appointment.get("status"));
    }

    private void setId(Object entity, Long id) {
        try {
            var field = entity.getClass().getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
        } catch (ReflectiveOperationException exception) {
            throw new AssertionError(exception);
        }
    }
}
