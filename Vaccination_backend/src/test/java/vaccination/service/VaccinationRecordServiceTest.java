package vaccination.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import vaccination.model.Booking;
import vaccination.model.User;
import vaccination.model.VaccinationRecord;
import vaccination.model.Vaccine;
import vaccination.repository.VaccinationRecordRepository;
import vaccination.repository.VaccineRepository;

class VaccinationRecordServiceTest {
    private VaccinationRecordRepository recordRepository;
    private VaccineRepository vaccineRepository;
    private VaccinationRecordService service;

    @BeforeEach
    void setUp() {
        recordRepository = mock(VaccinationRecordRepository.class);
        vaccineRepository = mock(VaccineRepository.class);
        service = new VaccinationRecordService(recordRepository, vaccineRepository);
    }

    @Test
    void createsOneVaccinationRecordForACompletedBooking() {
        User patient = new User("Patient", "patient@example.test", "unused", "USER");
        setId(patient, 3L);
        Booking booking = new Booking(
                patient, "Kauvery Hospital", "BCG Vaccine", "2026-10-16", "11:00 AM - 03:00 PM");
        setId(booking, 41L);
        when(recordRepository.findByBookingId(41L)).thenReturn(Optional.empty());
        when(vaccineRepository.findByVaccineNameIgnoreCase("BCG Vaccine"))
                .thenReturn(Optional.of(new Vaccine("BCG Vaccine", "Manufacturer", "Dose 1", "Description")));

        service.recordCompletedBooking(booking);

        ArgumentCaptor<VaccinationRecord> record = ArgumentCaptor.forClass(VaccinationRecord.class);
        verify(recordRepository).save(record.capture());
        assertEquals(41L, record.getValue().getBookingId());
        assertEquals(3L, record.getValue().getUserId());
        assertEquals("BCG Vaccine", record.getValue().getVaccine());
        assertEquals("2026-10-16", record.getValue().getVaccinationDate());
        assertEquals("Dose 1", record.getValue().getDose());
        assertEquals("COMPLETED", record.getValue().getStatus());
    }

    @Test
    void doesNotDuplicateAnExistingCompletedBookingRecord() {
        Booking booking = new Booking(
                new User("Patient", "patient@example.test", "unused", "USER"),
                "Kauvery Hospital", "BCG Vaccine", "2026-10-16", "11:00 AM - 03:00 PM");
        setId(booking, 41L);
        when(recordRepository.findByBookingId(41L))
                .thenReturn(Optional.of(new VaccinationRecord(
                        41L, 3L, "BCG Vaccine", "2026-10-16", "Dose 1", "COMPLETED")));

        service.recordCompletedBooking(booking);

        verify(recordRepository, never()).save(any(VaccinationRecord.class));
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
