package in.sih.vaspattribution.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.sih.vaspattribution.cases.controller.VaspRequestController;
import in.sih.vaspattribution.cases.dto.CreateVaspRequestDto;
import in.sih.vaspattribution.cases.dto.VaspRequestDto;
import in.sih.vaspattribution.cases.service.VaspRequestService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ContextConfiguration;
import in.sih.vaspattribution.VaspAttributionTestApp;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ContextConfiguration(classes = VaspAttributionTestApp.class)
@WebMvcTest(VaspRequestController.class)

public class VaspRequestControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private VaspRequestService vaspRequestService;

    private final UUID caseId = UUID.randomUUID();
    private final UUID entityId = UUID.randomUUID();
    private final UUID vaspReqId = UUID.randomUUID();

    @Test
    void createVaspRequest_shouldReturn201() throws Exception {
        VaspRequestDto dto = VaspRequestDto.builder()
                .id(vaspReqId).caseId(caseId).entityId(entityId)
                .requestType("SUBPOENA").status("DRAFT").build();
        when(vaspRequestService.createVaspRequest(eq(caseId), any(), any())).thenReturn(dto);

        CreateVaspRequestDto request = new CreateVaspRequestDto();
        request.setEntityId(entityId);
        request.setRequestType("SUBPOENA");
        request.setNotes("Need data");

        mockMvc.perform(post("/api/v1/cases/" + caseId + "/vasp-requests").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt().jwt(j -> j.subject("123e4567-e89b-12d3-a456-426614174000")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andExpect(jsonPath("$.data.requestType").value("SUBPOENA"));
    }

    @Test
    void getVaspRequests_shouldReturn200() throws Exception {
        VaspRequestDto dto = VaspRequestDto.builder()
                .id(vaspReqId).caseId(caseId).entityId(entityId)
                .requestType("SUBPOENA").status("DRAFT").build();
        when(vaspRequestService.getVaspRequestsByCaseId(caseId)).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/cases/" + caseId + "/vasp-requests").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt().jwt(j -> j.subject("123e4567-e89b-12d3-a456-426614174000"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].status").value("DRAFT"));
    }
}






