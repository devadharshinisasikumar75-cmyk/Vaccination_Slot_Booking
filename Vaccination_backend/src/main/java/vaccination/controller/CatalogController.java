package vaccination.controller;

import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import vaccination.model.VaccinationCenter;
import vaccination.model.Vaccine;
import vaccination.repository.VaccinationCenterRepository;
import vaccination.repository.VaccineRepository;

@RestController
public class CatalogController {
    private final VaccineRepository vaccineRepository;
    private final VaccinationCenterRepository centerRepository;

    public CatalogController(
            VaccineRepository vaccineRepository,
            VaccinationCenterRepository centerRepository) {
        this.vaccineRepository = vaccineRepository;
        this.centerRepository = centerRepository;
    }

    @GetMapping("/api/catalog/vaccines")
    public List<Vaccine> getVaccines() {
        return vaccineRepository.findAll();
    }

    @PostMapping("/api/catalog/vaccines")
    public ResponseEntity<?> addVaccine(@RequestBody Map<String, String> request) {
        String name = value(request, "vaccineName");
        if (name == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vaccine name is required."));
        }
        if (vaccineRepository.existsByVaccineNameIgnoreCase(name)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "That vaccine is already registered."));
        }

        Vaccine vaccine = new Vaccine(
                name,
                value(request, "manufacturer"),
                value(request, "dose"),
                value(request, "description"));
        return ResponseEntity.status(HttpStatus.CREATED).body(vaccineRepository.save(vaccine));
    }

    @GetMapping("/api/catalog/centers")
    public List<VaccinationCenter> getCenters() {
        return centerRepository.findAll();
    }

    @PostMapping("/api/catalog/centers")
    public ResponseEntity<?> addCenter(@RequestBody Map<String, String> request) {
        String name = value(request, "centerName");
        if (name == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Center name is required."));
        }
        if (centerRepository.existsByCenterNameIgnoreCase(name)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "That vaccination center is already registered."));
        }

        VaccinationCenter center = new VaccinationCenter(
                name,
                value(request, "location"),
                value(request, "contact"),
                true);
        return ResponseEntity.status(HttpStatus.CREATED).body(centerRepository.save(center));
    }

    private String value(Map<String, String> request, String field) {
        if (request == null || request.get(field) == null) {
            return null;
        }
        String value = request.get(field).trim();
        return value.isEmpty() ? null : value;
    }
}
