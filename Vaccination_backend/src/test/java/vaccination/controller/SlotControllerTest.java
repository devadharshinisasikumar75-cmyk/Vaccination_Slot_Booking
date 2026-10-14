package vaccination.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import vaccination.model.Slot;
import vaccination.model.VaccinationCenter;
import vaccination.model.Vaccine;
import vaccination.repository.SlotRepository;
import vaccination.repository.VaccinationCenterRepository;
import vaccination.repository.VaccineRepository;

class SlotControllerTest {
    private SlotRepository slotRepository;
    private VaccinationCenterRepository centerRepository;
    private VaccineRepository vaccineRepository;
    private SlotController controller;

    @BeforeEach
    void setUp() {
        slotRepository = mock(SlotRepository.class);
        centerRepository = mock(VaccinationCenterRepository.class);
        vaccineRepository = mock(VaccineRepository.class);
        controller = new SlotController(slotRepository, centerRepository, vaccineRepository);
    }

    @Test
    void createsSlotForActiveCenterOnFutureDate() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        Map<String, Object> request = Map.of(
                "center", "VaxCare Clinic",
                "vaccine", "Flu Vaccine",
                "date", tomorrow.toString(),
                "startTime", "10:30",
                "endTime", "11:30",
                "capacity", "20");
        List<VaccinationCenter> centers = List.of(
                new VaccinationCenter("VaxCare Clinic", "Local", "000", true));
        when(vaccineRepository.findByVaccineNameIgnoreCase("Flu Vaccine"))
                .thenReturn(java.util.Optional.of(new Vaccine("Flu Vaccine", "Manufacturer", "1", "Test")));
        when(slotRepository.existsByCenterAndDateAndVaccineIgnoreCaseAndStartTime(
                "VaxCare Clinic", tomorrow.toString(), "Flu Vaccine", "10:30")).thenReturn(false);
        when(centerRepository.findAll()).thenReturn(centers);
        when(slotRepository.save(org.mockito.ArgumentMatchers.any(Slot.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ResponseEntity<?> response = controller.createSlot(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        Slot created = (Slot) response.getBody();
        assertEquals("VaxCare Clinic", created.getCenter());
        assertEquals("Flu Vaccine", created.getVaccine());
        assertEquals(tomorrow.toString(), created.getDate());
        assertEquals("10:30", created.getStartTime());
        assertEquals("11:30", created.getEndTime());
        assertEquals("10:30 AM - 11:30 AM", created.getTime());
        assertEquals(20, created.getCapacity());
        assertEquals(0, created.getBooked());
        verify(slotRepository).save(org.mockito.ArgumentMatchers.any(Slot.class));
    }

    @Test
    void rejectsPastSlotDateAndInvalidTime() {
        Map<String, Object> request = Map.of(
                "center", "VaxCare Clinic",
                "vaccine", "Flu Vaccine",
                "date", LocalDate.now().minusDays(1).toString(),
                "startTime", "10:30",
                "endTime", "11:30",
                "capacity", "10");

        ResponseEntity<?> response = controller.createSlot(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void rejectsInactiveOrUnknownCenter() {
        Map<String, Object> request = Map.of(
                "center", "Unknown Clinic",
                "vaccine", "Flu Vaccine",
                "date", LocalDate.now().plusDays(1).toString(),
                "startTime", "10:30",
                "endTime", "11:30",
                "capacity", "10");
        when(centerRepository.findAll()).thenReturn(List.of());

        ResponseEntity<?> response = controller.createSlot(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void rejectsDuplicateSlot() {
        String date = LocalDate.now().plusDays(1).toString();
        Map<String, Object> request = Map.of(
                "center", "VaxCare Clinic",
                "vaccine", "Flu Vaccine",
                "date", date,
                "startTime", "10:30",
                "endTime", "11:30",
                "capacity", "10");
        when(centerRepository.findAll()).thenReturn(
                List.of(new VaccinationCenter("VaxCare Clinic", "Local", "000", true)));
        when(vaccineRepository.findByVaccineNameIgnoreCase("Flu Vaccine"))
                .thenReturn(java.util.Optional.of(new Vaccine("Flu Vaccine", "Manufacturer", "1", "Test")));
        when(slotRepository.existsByCenterAndDateAndVaccineIgnoreCaseAndStartTime(
                "VaxCare Clinic", date, "Flu Vaccine", "10:30")).thenReturn(true);

        ResponseEntity<?> response = controller.createSlot(request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        verify(slotRepository, org.mockito.Mockito.never())
                .save(org.mockito.ArgumentMatchers.any(Slot.class));
    }

    @Test
    void rejectsEndTimeThatIsNotAfterStartTime() {
        Map<String, Object> request = Map.of(
        "center", "VaxCare Clinic",
        "vaccine", "Flu Vaccine",
        "date", LocalDate.now().plusDays(1).toString(),
        "startTime", "11:30",
        "endTime", "10:30",
        "capacity", "10");

        ResponseEntity<?> response = controller.createSlot(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void availableSlotsAreFilteredBySelectedVaccine() {
        String date = LocalDate.now().plusDays(1).toString();
        Slot matchingSlot = new Slot("VaxCare Clinic", date, "10:30 AM - 11:30 AM", 20);
        matchingSlot.setVaccine("Flu Vaccine");
        matchingSlot.setStartTime("10:30");
        Slot otherVaccineSlot = new Slot("VaxCare Clinic", date, "11:30 AM - 12:30 PM", 20);
        otherVaccineSlot.setVaccine("Travel Vaccine");
        otherVaccineSlot.setStartTime("11:30");
        Slot legacySlot = new Slot("VaxCare Clinic", date, "12:30 PM", 20);

        when(slotRepository.findByCenterAndDate("VaxCare Clinic", date))
                .thenReturn(List.of(matchingSlot, otherVaccineSlot, legacySlot));

        ResponseEntity<?> response = controller.getAvailableSlots(
                "VaxCare Clinic", date, "Flu Vaccine");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        List<?> availableSlots = (List<?>) response.getBody();
        assertEquals(1, availableSlots.size());
        assertSame(matchingSlot, availableSlots.get(0));
    }
}
