package in.sih.vaspattribution.controller;

import in.sih.vaspattribution.finding.controller.FindingController;
import in.sih.vaspattribution.finding.dto.FindingDto;
import in.sih.vaspattribution.finding.service.FindingService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FindingController.class)
public class FindingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FindingService findingService;

    @Test
    @WithMockUser
    public void testGetFindings() throws Exception {
        UUID invId = UUID.randomUUID();
        
        FindingDto f1 = FindingDto.builder()
            .id(UUID.randomUUID())
            .investigationId(invId)
            .type("RAPID_FORWARDING")
            .evidence("Funds forwarded in less than 1 hour")
            .severity("HIGH")
            .build();

        FindingDto f2 = FindingDto.builder()
            .id(UUID.randomUUID())
            .investigationId(invId)
            .type("VASP_EXPOSURE")
            .evidence("Found VASP Binance at distance 1")
            .severity("CRITICAL")
            .build();

        Mockito.when(findingService.getFindingsByInvestigationId(invId)).thenReturn(List.of(f1, f2));

        mockMvc.perform(get("/api/v1/investigations/" + invId + "/findings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].type").value("RAPID_FORWARDING"))
                .andExpect(jsonPath("$.data[0].evidence").value("Funds forwarded in less than 1 hour"))
                .andExpect(jsonPath("$.data[1].type").value("VASP_EXPOSURE"))
                .andExpect(jsonPath("$.data[1].evidence").value("Found VASP Binance at distance 1"));
    }
}
