package in.sih.vaspattribution.controller;

import in.sih.vaspattribution.entity.controller.EntityController;
import in.sih.vaspattribution.entity.dto.EntityResponse;
import in.sih.vaspattribution.entity.service.EntityService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ContextConfiguration;
import in.sih.vaspattribution.VaspAttributionTestApp;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ContextConfiguration(classes = VaspAttributionTestApp.class)
@WebMvcTest(EntityController.class)

public class EntityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EntityService entityService;

    @Test
    void getEntityByAddress_shouldReturn200() throws Exception {
        EntityResponse response = EntityResponse.builder()
                .chain("ethereum")
                .address("0xBINANCE")
                .entity(EntityResponse.EntityDto.builder()
                        .entityId(UUID.randomUUID())
                        .name("Binance")
                        .type("EXCHANGE")
                        .build())
                .confidence(0.95)
                .build();
        when(entityService.findByAddress("ethereum", "0xBINANCE")).thenReturn(response);

        mockMvc.perform(get("/api/v1/entities/address/ethereum/0xBINANCE").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt().jwt(j -> j.subject("123e4567-e89b-12d3-a456-426614174000"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.entity.name").value("Binance"));
    }
}






