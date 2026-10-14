package vaccination.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RestController;

import vaccination.model.Slot;
import vaccination.model.Vaccine;
import vaccination.repository.SlotRepository;
import vaccination.repository.VaccinationCenterRepository;
import vaccination.repository.VaccineRepository;
import vaccination.util.SlotTimeParser;

@RestController
public class SlotController {
    final SlotRepository slotRepository;
    final VaccinationCenterRepository centerRepository;
    final VaccineRepository vaccineRepository;

    public SlotController(
            SlotRepository slotRepository,
            VaccinationCenterRepository centerRepository,
            VaccineRepository vaccineRepository) {
        this.slotRepository = slotRepository;
        this.centerRepository = centerRepository;
        this.vaccineRepository = vaccineRepository;
    }

    @GetMapping("/api/slots")
    public ResponseEntity<?> getAllSlots() {
        try {
            return ResponseEntity.ok(slotRepository.findAll());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Unable to load slots"));
        }
    }

    @GetMapping("/api/slots/by-center/{center}")
    public ResponseEntity<?> getSlotsByCenter(
            @PathVariable String center) {
        try {
            return ResponseEntity.ok(
                    slotRepository.findByCenter(center)
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Unable to load slots"));
        }
    }

    @GetMapping("/api/slots/center/{center}")
    public ResponseEntity<?> getSlotsByCenterAlternative(
            @PathVariable String center) {
        try {
            return ResponseEntity.ok(
                    slotRepository.findByCenter(center)
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Unable to load slots"));
        }
    }

    @GetMapping("/api/slots/by-date/{date}")
    public ResponseEntity<?> getSlotsByDate(
            @PathVariable String date) {
        try {
            return ResponseEntity.ok(
                    slotRepository.findByDate(date)
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Unable to load slots"));
        }
    }

    @GetMapping("/api/slots/date/{date}")
    public ResponseEntity<?> getSlotsByDateAlternative(
            @PathVariable String date) {
        try {
            return ResponseEntity.ok(
                    slotRepository.findByDate(date)
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of("message", "Unable to load slots"));
        }
    }

    @GetMapping("/api/slots/available")
    public ResponseEntity<?> getAvailableSlots(
            @RequestParam(required = false) String center,
            @RequestParam(required = false) String date,
            @RequestParam(required = false) String vaccine) {
        try {

            Iterable<Slot> allSlots;
            if (center != null && date != null) {
                allSlots = slotRepository.findByCenterAndDate(center, date);
            } else if (center != null) {
                allSlots = slotRepository.findByCenter(center);
            } else if (date != null) {
                allSlots = slotRepository.findByDate(date);
            } else {
                allSlots = slotRepository.findAll();
            }
            List<Slot> availableSlots = new ArrayList<>();

            for (Slot slot : allSlots) {
                boolean matchesVaccine = vaccine == null || vaccine.isBlank()
                        || (slot.getVaccine() != null
                                && slot.getVaccine().equalsIgnoreCase(vaccine.trim()));
                if (matchesVaccine && slot.getBooked() < slot.getCapacity() && isFutureSlot(slot)) {
                    availableSlots.add(slot);
                }
            }

            return ResponseEntity.ok(availableSlots);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of(
                            "message",
                            "Unable to load available slots"
                    ));
        }
    }

    @PostMapping("/api/slots")
    public ResponseEntity<?> createSlot(@RequestBody Map<String, Object> request) {
        if (request == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Slot details are required."));
        }
        String center = text(request.get("center"));
        String vaccine = text(request.get("vaccine"));
        String date = text(request.get("date"));
        String startTime = text(request.get("startTime"));
        String endTime = text(request.get("endTime"));
        int capacity;
        try {
            capacity = Integer.parseInt(String.valueOf(request.get("capacity")));
        } catch (NumberFormatException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", "Capacity must be a positive number."));
        }
        if (center == null || vaccine == null || date == null
                || startTime == null || endTime == null || capacity < 1) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message",
                            "Center, vaccine, future date, start/end times, and positive capacity are required."));
        }
        try {
            LocalDate slotDate = LocalDate.parse(date);
            LocalTime slotStart = LocalTime.parse(startTime);
            LocalTime slotEnd = LocalTime.parse(endTime);
            if (!slotEnd.isAfter(slotStart)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "End time must be later than start time."));
            }
            if (LocalDateTime.of(slotDate, slotStart).isBefore(LocalDateTime.now())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Slot date and time must be in the future."));
            }
        } catch (DateTimeParseException exception) {
            String message = "Date must use YYYY-MM-DD format and time must be a valid time.";
            return ResponseEntity.badRequest().body(Map.of("message", message));
        }
        if (centerRepository.findAll().stream()
                .noneMatch(saved -> saved.isAvailable() && saved.getCenterName().equalsIgnoreCase(center))) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Choose an active vaccination center from the catalog."));
        }
        Vaccine selectedVaccine = vaccineRepository.findByVaccineNameIgnoreCase(vaccine).orElse(null);
        if (selectedVaccine == null || !selectedVaccine.isAvailable()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Choose an active vaccine from the catalog."));
        }
        if (slotRepository.existsByCenterAndDateAndVaccineIgnoreCaseAndStartTime(
                center, date, selectedVaccine.getVaccineName(), startTime)) {
            return ResponseEntity.status(409)
                    .body(Map.of("message", "A slot already exists for this center, vaccine, date, and start time."));
        }
        String displayTime = DateTimeFormatter.ofPattern("hh:mm a", Locale.US).format(LocalTime.parse(startTime))
                + " - "
                + DateTimeFormatter.ofPattern("hh:mm a", Locale.US).format(LocalTime.parse(endTime));
        Slot slot = new Slot(center, date, displayTime, capacity);
        slot.setVaccine(selectedVaccine.getVaccineName());
        slot.setStartTime(startTime);
        slot.setEndTime(endTime);
        return ResponseEntity.status(201).body(slotRepository.save(slot));
    }

    private String text(Object value) {
        if (value == null) {
            return null;
        }
        String text = value.toString().trim();
        return text.isEmpty() ? null : text;
    }

    private boolean isFutureSlot(Slot slot) {
        try {
            LocalDate slotDate = LocalDate.parse(slot.getDate());
            LocalTime slotTime = slot.getStartTime() == null
                    ? SlotTimeParser.parseStartTime(slot.getTime())
                    : LocalTime.parse(slot.getStartTime());
            return !LocalDateTime.of(slotDate, slotTime).isBefore(LocalDateTime.now());
        } catch (DateTimeParseException exception) {
            return false;
        }
    }
}