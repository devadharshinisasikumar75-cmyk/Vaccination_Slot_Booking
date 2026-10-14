package vaccination.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import vaccination.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String email);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findAllByRoleIgnoreCase(String role);
}