package vaccination.model;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.junit.jupiter.api.Test;

class UserJsonTest {
    @Test
    void passwordIsMarkedAsWriteOnlyForJson() throws Exception {
        JsonProperty property = User.class.getDeclaredField("password")
                .getAnnotation(JsonProperty.class);

        assertEquals(JsonProperty.Access.WRITE_ONLY, property.access());
    }
}
