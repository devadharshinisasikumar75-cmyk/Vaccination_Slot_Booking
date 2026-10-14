package vaccination.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vaccination.model.LoginHistory;

public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {
}