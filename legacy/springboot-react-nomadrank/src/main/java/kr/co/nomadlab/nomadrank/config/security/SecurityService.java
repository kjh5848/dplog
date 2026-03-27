package kr.co.nomadlab.nomadrank.config.security;

import kr.co.nomadlab.nomadrank.common.exception.BadRequestException;
import kr.co.nomadlab.nomadrank.domain.auth.enums.UserStatus;
import kr.co.nomadlab.nomadrank.model.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SecurityService implements UserDetailsService {
    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = userRepository.findByUsername(username).orElseThrow(() -> new BadRequestException("아이디를 찾을 수 없습니다."));
        if (user.getStatus().equals(UserStatus.WITHDRAW)) {
            throw new BadRequestException("탈퇴된 회원입니다.");
        } else if (user.getStatus().equals(UserStatus.WAITING)) {
            throw new BadRequestException("심사중입니다.");
        }
        return new SecurityAccount(user);
    }

}
