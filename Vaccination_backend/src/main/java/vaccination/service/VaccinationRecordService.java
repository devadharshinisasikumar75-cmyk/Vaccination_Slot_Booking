package vaccination.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import vaccination.model.Booking;
import vaccination.model.VaccinationRecord;
import vaccination.repository.VaccinationRecordRepository;
import vaccination.repository.VaccineRepository;

@Service
public class VaccinationRecordService {
    private final VaccinationRecordRepository recordRepository;
    private final VaccineRepository vaccineRepository;

    public VaccinationRecordService(
            VaccinationRecordRepository recordRepository,
            VaccineRepository vaccineRepository) {
        this.recordRepository = recordRepository;
        this.vaccineRepository = vaccineRepository;
    }

    @Transactional
    public void recordCompletedBooking(Booking booking) {
        if (booking.getId() == null || booking.getUser() == null) {
            throw new IllegalStateException("A saved booking with a patient is required.");
        }
        if (recordRepository.findByBookingId(booking.getId()).isPresent()) {
            return;
        }

        String dose = vaccineRepository.findByVaccineNameIgnoreCase(booking.getVaccine())
                .map(vaccine -> vaccine.getDose())
                .orElse(null);
        VaccinationRecord record = new VaccinationRecord(
                booking.getId(),
                booking.getUser().getId(),
                booking.getVaccine(),
                booking.getBookingDate(),
                dose,
                "COMPLETED");
        recordRepository.save(record);
    }
}
