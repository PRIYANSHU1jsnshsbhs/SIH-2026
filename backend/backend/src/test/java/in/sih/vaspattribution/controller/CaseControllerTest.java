package in.sih.vaspattribution.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.sih.vaspattribution.cases.controller.CaseController;
import in.sih.vaspattribution.cases.dto.CaseDto;
import in.sih.vaspattribution.cases.dto.CreateCaseRequest;
import in.sih.vaspattribution.cases.dto.UpdateCaseRequest;
import in.sih.vaspattribution.cases.service.CaseService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ContextConfiguration;
import in.sih.vaspattribution.VaspAttributionTestApp;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ContextConfiguration(classes = VaspAttributionTestApp.class)
@WebMvcTest(CaseController.class)

public class CaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CaseService caseService;

    private final UUID caseId = UUID.randomUUID();
    private final UUID userId = UUID.randomUUID();

    @Test
    void createCase_shouldReturn200() throws Exception {
        CreateCaseRequest request = new CreateCaseRequest();
        request.setCaseNumber("CASE-001");
        request.setTitle("Test Case");
        request.setPriority("HIGH");
        
        CaseDto responseDto = CaseDto.builder()
                .id(caseId)
                .caseNumber("CASE-001")
                .title("Test Case")
                .status("OPEN")
                .build();

        when(caseService.createCase(any(), any())).thenReturn(responseDto);

        mockMvc.perform(post("/api/v1/cases").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt().jwt(j -> j.subject("123e4567-e89b-12d3-a456-426614174000")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.caseNumber").value("CASE-001"));
    }

    @Test
    void getAllCases_shouldReturn200() throws Exception {
        CaseDto responseDto = CaseDto.builder()
                .id(caseId)
                .caseNumber("CASE-001")
                .title("Test Case")
                .build();
        
        Page<CaseDto> page = new PageImpl<>(List.of(responseDto));
        when(caseService.getAllCases(any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/cases?page=0&size=20").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt().jwt(j -> j.subject("123e4567-e89b-12d3-a456-426614174000"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].caseNumber").value("CASE-001"));
    }

    @Test
    void updateCase_shouldReturn200() throws Exception {
        UpdateCaseRequest request = new UpdateCaseRequest();
        request.setStatus("CLOSED");

        CaseDto responseDto = CaseDto.builder()
                .id(caseId)
                .caseNumber("CASE-001")
                .title("Test Case")
                .status("CLOSED")
                .build();

        when(caseService.updateCase(eq(caseId), any())).thenReturn(responseDto);

        mockMvc.perform(patch("/api/v1/cases/" + caseId).with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt().jwt(j -> j.subject("123e4567-e89b-12d3-a456-426614174000")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CLOSED"));
    }
}






