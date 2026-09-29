package in.sih.vaspattribution.config;

import in.sih.vaspattribution.auth.entity.User;
import in.sih.vaspattribution.auth.repository.UserRepository;
import in.sih.vaspattribution.entity.entity.EntityAddress;
import in.sih.vaspattribution.entity.entity.VaspEntity;
import in.sih.vaspattribution.entity.repository.EntityAddressRepository;
import in.sih.vaspattribution.entity.repository.VaspEntityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Slf4j
@Component
@Profile({"dev", "local"})
@RequiredArgsConstructor
public class DevDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final VaspEntityRepository vaspEntityRepository;
    private final EntityAddressRepository entityAddressRepository;

    @Override
    public void run(String... args) throws Exception {
        log.info("Seeding dev data...");

        if (userRepository.findByUsername("admin").isEmpty()) {
            User admin = new User();
            admin.setId(UUID.randomUUID());
            admin.setUsername("admin");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setName("Admin User");
            admin.setRole("ADMIN");
            userRepository.save(admin);
            log.info("Created admin user");
        }

        if (userRepository.findByUsername("demo").isEmpty()) {
            User demo = new User();
            demo.setId(UUID.randomUUID());
            demo.setUsername("demo");
            demo.setPasswordHash(passwordEncoder.encode("thisisit"));
            demo.setName("Demo Investigator");
            demo.setRole("INVESTIGATOR");
            userRepository.save(demo);
            log.info("Created demo user");
        }

        if (userRepository.findByUsername("dev").isEmpty()) {
            User dev = new User();
            dev.setId(UUID.randomUUID());
            dev.setUsername("dev");
            dev.setPasswordHash(passwordEncoder.encode("thisisit"));
            dev.setName("DevOps Engineer");
            dev.setRole("DEVOPS");
            userRepository.save(dev);
            log.info("Created dev user");
        }

        if (userRepository.findByUsername("mock").isEmpty()) {
            User mock = new User();
            mock.setId(UUID.randomUUID());
            mock.setUsername("mock");
            mock.setPasswordHash(passwordEncoder.encode("thisisit"));
            mock.setName("Mock User");
            mock.setRole("INVESTIGATOR");
            userRepository.save(mock);
            log.info("Created mock user");
        }

        if (vaspEntityRepository.count() == 0) {
            VaspEntity demoA = new VaspEntity();
            demoA.setId(UUID.randomUUID());
            demoA.setName("Demo Exchange A");
            demoA.setEntityType("EXCHANGE");
            demoA.setJurisdiction("Cayman Islands");
            vaspEntityRepository.save(demoA);

            EntityAddress demoAAddr = new EntityAddress();
            demoAAddr.setId(UUID.randomUUID());
            demoAAddr.setEntity(demoA);
            demoAAddr.setChain("ethereum");
            demoAAddr.setAddress("Exchange1");
            entityAddressRepository.save(demoAAddr);
            
            VaspEntity demoB = new VaspEntity();
            demoB.setId(UUID.randomUUID());
            demoB.setName("Demo Exchange B");
            demoB.setEntityType("EXCHANGE");
            demoB.setJurisdiction("USA");
            vaspEntityRepository.save(demoB);

            EntityAddress demoBAddr = new EntityAddress();
            demoBAddr.setId(UUID.randomUUID());
            demoBAddr.setEntity(demoB);
            demoBAddr.setChain("ethereum");
            demoBAddr.setAddress("Exchange2");
            entityAddressRepository.save(demoBAddr);

            VaspEntity mockVasp = new VaspEntity();
            mockVasp.setId(UUID.randomUUID());
            mockVasp.setName("Mock Dataset VASP");
            mockVasp.setEntityType("EXCHANGE");
            mockVasp.setJurisdiction("Mockland");
            vaspEntityRepository.save(mockVasp);

            EntityAddress mockAddr = new EntityAddress();
            mockAddr.setId(UUID.randomUUID());
            mockAddr.setEntity(mockVasp);
            mockAddr.setChain("mock");
            mockAddr.setAddress("node-10");
            entityAddressRepository.save(mockAddr);
            
            // Just to be sure, seed another one
            EntityAddress mockAddr2 = new EntityAddress();
            mockAddr2.setId(UUID.randomUUID());
            mockAddr2.setEntity(mockVasp);
            mockAddr2.setChain("mock");
            mockAddr2.setAddress("node-20");
            entityAddressRepository.save(mockAddr2);

            log.info("Created seed VASP entities");
        }
    }
}
