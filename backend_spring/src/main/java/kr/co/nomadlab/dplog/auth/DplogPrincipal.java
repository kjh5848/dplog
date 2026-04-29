package kr.co.nomadlab.dplog.auth;

import java.io.Serializable;
import java.util.UUID;

public record DplogPrincipal(UUID userId, String email, UserRole role) implements Serializable {
}
