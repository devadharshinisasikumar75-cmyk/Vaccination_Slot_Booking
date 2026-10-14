package vaccination.controller;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.mockito.Mockito;

class BookingControllerTest {
    @Test
    void acceptsFutureAppointmentWithAmPmSlotRange() {
        String futureDate = LocalDate.now().plusDays(5).toString();

        assertTrue(BookingController.isFutureAppointment(
                futureDate, "08:15 AM - 11:15 AM"));
    }

    @Test
    void acceptsFutureAppointmentWithTwentyFourHourTime() {
        String futureDate = LocalDate.now().plusDays(5).toString();

        assertTrue(BookingController.isFutureAppointment(futureDate, "10:00"));
    }

    @Test
    void rejectsPastAppointmentsAndMalformedTimes() {
        assertFalse(BookingController.isFutureAppointment(
                LocalDate.now().minusDays(1).toString(), "08:15 AM - 11:15 AM"));
        assertFalse(BookingController.isFutureAppointment(
                LocalDate.now().plusDays(5).toString(), "not-a-time"));
    }

    @Test
    void doesNotMarkFutureBookingAsCompleted() throws Exception {
        BookingController controller = new BookingController();
        var bookingRepository = Mockito.mock(vaccination.repository.BookingRepository.class);
        var booking = new vaccination.model.Booking(
                new vaccination.model.User("Patient", "patient@example.test", "unused", "USER"),
                "Kauvery Hospital",
                "BCG Vaccine",
                LocalDate.now().plusDays(5).toString(),
                "08:15 AM - 11:15 AM");
        var id = vaccination.model.Booking.class.getDeclaredField("id");
        id.setAccessible(true);
        id.set(booking, 1L);

        var repositoryField = BookingController.class.getDeclaredField("bookingRepository");
        repositoryField.setAccessible(true);
        repositoryField.set(controller, bookingRepository);
        Mockito.when(bookingRepository.findById(1L)).thenReturn(Optional.of(booking));

        ResponseEntity<?> response = controller.updateBookingStatus(
                1L, Map.of("status", "COMPLETED"));

        org.junit.jupiter.api.Assertions.assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        Mockito.verify(bookingRepository, Mockito.never()).save(Mockito.any());
    }
}
