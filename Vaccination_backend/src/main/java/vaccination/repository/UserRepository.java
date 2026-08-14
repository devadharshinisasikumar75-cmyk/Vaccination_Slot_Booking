package vaccination.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import vaccination.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String email);
}