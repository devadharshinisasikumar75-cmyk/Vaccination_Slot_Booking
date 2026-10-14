package vaccination.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import vaccination.model.Booking;
import vaccination.model.Slot;
import vaccination.model.User;
import vaccination.repository.BookingRepository;
import vaccination.repository.SlotRepository;
import vaccination.repository.UserRepository;
import vaccination.security.UserAccessService;
import vaccination.service.VaccinationRecordService;
import vaccination.util.SlotTimeParser;

@RestController
public class BookingController {
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private UserAccessService userAccessService;

    @Autowired
    private VaccinationRecordService vaccinationRecordService;

    @PostMapping("/api/bookings")
    public ResponseEntity<?> createBooking(
            @RequestBody Map<String, Object> bookingRequest,
            Authentication authentication) {

        try {

            if (bookingRequest == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid booking details"));
            }

            Object userIdObject = bookingRequest.get("userId");

            if (userIdObject == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User ID is required"));
            }

            Long userId;
            try {
                userId = userIdObject instanceof Number number
                        ? number.longValue()
                        : Long.valueOf(userIdObject.toString().trim());
            } catch (NumberFormatException exception) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User ID is invalid"));
            }
            if (!userAccessService.isCurrentUser(authentication, userId)) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", "You can only book for your own account."));
            }

            String center = (String) bookingRequest.get("center");
            String vaccine = (String) bookingRequest.get("vaccine");

            String bookingDate = (String) bookingRequest.get("bookingDate");

            if (bookingDate == null) {
                bookingDate = (String) bookingRequest.get("date");
            }

            String bookingTime = (String) bookingRequest.get("bookingTime");

            if (bookingTime == null) {
                bookingTime = (String) bookingRequest.get("time");
            }

            if (center == null || center.trim().isEmpty() ||
                    vaccine == null || vaccine.trim().isEmpty() ||
                    bookingDate == null || bookingDate.trim().isEmpty() ||
                    bookingTime == null || bookingTime.trim().isEmpty()) {

                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Please provide all booking details"));
            }

            center = center.trim();
            vaccine = vaccine.trim();
            bookingDate = bookingDate.trim();
            bookingTime = bookingTime.trim();

            if (!isFutureAppointment(bookingDate, bookingTime)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Past vaccination dates or times cannot be booked."));
            }

            User user = userRepository.findById(userId).orElse(null);

            if (user == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User not found"));
            }

            Slot selectedSlot = null;
            Object slotIdObject = bookingRequest.get("slotId");
            if (slotIdObject != null) {
                try {
                    Long slotId = slotIdObject instanceof Number number
                            ? number.longValue()
                            : Long.valueOf(slotIdObject.toString().trim());
                    selectedSlot = slotRepository.findById(slotId).orElse(null);
                } catch (NumberFormatException exception) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "Selected slot is invalid."));
                }
                if (selectedSlot == null
                        || !center.equalsIgnoreCase(selectedSlot.getCenter())
                        || !bookingDate.equals(selectedSlot.getDate())
                        || selectedSlot.getVaccine() == null
                        || !vaccine.equalsIgnoreCase(selectedSlot.getVaccine())
                        || !bookingTime.equals(selectedSlot.getTime())
                        || selectedSlot.getBooked() >= selectedSlot.getCapacity()) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("message", "The selected slot is no longer available."));
                }
            } else {
                Iterable<Slot> matchingSlots = slotRepository.findByCenterAndDate(center, bookingDate);
                for (Slot slot : matchingSlots) {
                    String slotTime = slot.getTime();
                    if (slot.getVaccine() != null
                            && vaccine.equalsIgnoreCase(slot.getVaccine())
                            && slotTime != null
                            && (slotTime.equals(bookingTime)
                                    || (slot.getStartTime() != null
                                            && slot.getStartTime().equals(bookingTime)))
                            && slot.getBooked() < slot.getCapacity()) {
                        selectedSlot = slot;
                        break;
                    }
                }
            }

            if (selectedSlot == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of(
                                "message",
                                "No available slot for the selected center, vaccine, date and time"
                        ));
            }

            Booking booking = new Booking(
                    user,
                    center,
                    vaccine,
                    bookingDate,
                    selectedSlot.getTime()
            );

            Booking savedBooking = bookingRepository.save(booking);

            selectedSlot.setBooked(selectedSlot.getBooked() + 1);
            slotRepository.save(selectedSlot);

            return ResponseEntity.ok(createBookingResponse(savedBooking));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body(Map.of(
                            "message",
                            "Booking failed. Please try again."
                    ));
        }
    }

    static boolean isFutureAppointment(String date, String time) {
        try {
            LocalDateTime appointment = LocalDateTime.of(
                    LocalDate.parse(date),
                    SlotTimeParser.parseStartTime(time));
            return !appointment.isBefore(LocalDateTime.now());
        } catch (DateTimeParseException exception) {
            return false;
        }
    }

    @GetMapping("/api/bookings/{userId}")
    public ResponseEntity<?> getUserBookings(
            @PathVariable Long userId,
            Authentication authentication) {

        try {
            if (!userAccessService.canReadUser(authentication, userId)) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", "You are not allowed to view these appointments."));
            }

            User user = userRepository.findById(userId).orElse(null);

            if (user == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User not found"));
            }

            List<Booking> bookings = bookingRepository.findByUser(user);

            return ResponseEntity.ok(
                    Map.of("bookings", bookings)
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body(Map.of("message", "Unable to load bookings"));
        }
    }

    @GetMapping("/api/bookings/user/{userId}")
    public ResponseEntity<?> getUserBookingsForFrontend(
            @PathVariable Long userId,
            Authentication authentication) {

        try {
            if (!userAccessService.canReadUser(authentication, userId)) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", "You are not allowed to view these appointments."));
            }

            User user = userRepository.findById(userId).orElse(null);

            if (user == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User not found"));
            }

            List<Booking> bookings = bookingRepository.findByUser(user);

            List<Map<String, Object>> result = new ArrayList<>();

            for (Booking booking : bookings) {
                result.add(bookingToMap(booking));
            }

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body(Map.of("message", "Unable to load appointments"));
        }
    }

    @GetMapping("/api/bookings/user/{userId}/latest")
    public ResponseEntity<?> getLatestBooking(
            @PathVariable Long userId,
            Authentication authentication) {

        try {
            if (!userAccessService.canReadUser(authentication, userId)) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", "You are not allowed to view this appointment."));
            }

            User user = userRepository.findById(userId).orElse(null);

            if (user == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User not found"));
            }

            List<Booking> bookings = bookingRepository.findByUser(user);

            if (bookings.isEmpty()) {
                return ResponseEntity.status(404)
                        .body(Map.of("message", "No appointment found"));
            }

            Booking latest = bookings.get(bookings.size() - 1);

            for (Booking booking : bookings) {

                if (booking.getId() != null &&
                        latest.getId() != null &&
                        booking.getId() > latest.getId()) {

                    latest = booking;
                }
            }

            return ResponseEntity.ok(bookingToMap(latest));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body(Map.of("message", "Unable to load appointment"));
        }
    }

    @PutMapping("/api/bookings/{bookingId}/status")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> request) {

        try {

            Booking booking =
                    bookingRepository.findById(bookingId).orElse(null);

            if (booking == null) {
                return ResponseEntity.notFound().build();
            }

            String status = request.get("status");

            if (status == null || status.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Status is required"));
            }

            status = status.trim().toUpperCase();

            if (!status.equals("PENDING") &&
                    !status.equals("CONFIRMED") &&
                    !status.equals("COMPLETED") &&
                    !status.equals("CANCELLED")) {

                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid appointment status"));
            }

            if ("COMPLETED".equals(status)
                    && isFutureAppointment(booking.getBookingDate(), booking.getBookingTime())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message",
                                "A future appointment cannot be marked completed before the vaccination is given."));
            }

            booking.setStatus(status);

            Booking saved = bookingRepository.save(booking);
            if ("COMPLETED".equals(status)) {
                vaccinationRecordService.recordCompletedBooking(saved);
            }

            return ResponseEntity.ok(createBookingResponse(saved));

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body(Map.of(
                            "message",
                            "Unable to update appointment status"
                    ));
        }
    }

    @GetMapping("/api/vaccinations/user/{userId}")
    public ResponseEntity<?> getVaccinationStatus(
            @PathVariable Long userId,
            Authentication authentication) {

        try {
            if (!userAccessService.canReadUser(authentication, userId)) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", "You are not allowed to view this vaccination status."));
            }

            User user = userRepository.findById(userId).orElse(null);

            if (user == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "User not found"));
            }

            List<Booking> bookings = bookingRepository.findByUser(user);

            if (bookings.isEmpty()) {
                return ResponseEntity.status(404)
                        .body(Map.of("message", "No vaccination record found"));
            }

            Booking latest = bookings.get(bookings.size() - 1);

            for (Booking booking : bookings) {

                if (booking.getId() != null &&
                        latest.getId() != null &&
                        booking.getId() > latest.getId()) {

                    latest = booking;
                }
            }

            Map<String, Object> result = new HashMap<>();

            result.put(
                    "status",
                    latest.getStatus() == null
                            ? "PENDING"
                            : latest.getStatus()
            );

            result.put(
                    "vaccine",
                    latest.getVaccine() == null
                            ? "-"
                            : latest.getVaccine()
            );

            result.put(
                    "date",
                    latest.getBookingDate() == null
                            ? "-"
                            : latest.getBookingDate()
            );

            result.put(
                    "center",
                    latest.getCenter() == null
                            ? "-"
                            : latest.getCenter()
            );

            result.put("appointmentId", latest.getId());

            return ResponseEntity.ok(result);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.status(500)
                    .body(Map.of(
                            "message",
                            "Unable to load vaccination status"
                    ));
        }
    }

    private Map<String, Object> createBookingResponse(
            Booking booking) {

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Booking created successfully");
        response.put("booking", bookingToMap(booking));

        return response;
    }

    private Map<String, Object> bookingToMap(
            Booking booking) {

        Map<String, Object> data = new HashMap<>();

        data.put("id", booking.getId());

        data.put(
                "center",
                booking.getCenter() == null
                        ? "-"
                        : booking.getCenter()
        );

        data.put(
                "vaccine",
                booking.getVaccine() == null
                        ? "-"
                        : booking.getVaccine()
        );

        data.put(
                "bookingDate",
                booking.getBookingDate() == null
                        ? "-"
                        : booking.getBookingDate()
        );

        data.put(
                "bookingTime",
                booking.getBookingTime() == null
                        ? "-"
                        : booking.getBookingTime()
        );

        data.put(
                "date",
                booking.getBookingDate() == null
                        ? "-"
                        : booking.getBookingDate()
        );

        data.put(
                "time",
                booking.getBookingTime() == null
                        ? "-"
                        : booking.getBookingTime()
        );

        data.put(
                "status",
                booking.getStatus() == null
                        ? "PENDING"
                        : booking.getStatus()
        );

        if (booking.getUser() != null) {

            data.put("userId", booking.getUser().getId());

            data.put(
                    "userName",
                    booking.getUser().getName() == null
                            ? "User"
                            : booking.getUser().getName()
            );

            data.put(
                    "userEmail",
                    booking.getUser().getEmail() == null
                            ? "-"
                            : booking.getUser().getEmail()
            );

        } else {

            data.put("userName", "User");
            data.put("userEmail", "-");
        }

        return data;
    }
}