package in.sih.vaspattribution.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import in.sih.vaspattribution.report.controller.GlobalReportController;
import in.sih.vaspattribution.report.dto.CreateReportRequest;
import in.sih.vaspattribution.report.dto.ReportDto;
import in.sih.vaspattribution.report.service.ReportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ContextConfiguration;
import in.sih.vaspattribution.VaspAttributionTestApp;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Base64;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ContextConfiguration(classes = VaspAttributionTestApp.class)
@WebMvcTest(GlobalReportController.class)

public class GlobalReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ReportService reportService;

    private final UUID reportId = UUID.randomUUID();
    private final UUID investigationId = UUID.randomUUID();

    @Test
    void postReport_shouldReturn200() throws Exception {
        ReportDto dto = ReportDto.builder()
                .id(reportId).investigationId(investigationId).title("Test Report").build();
        when(reportService.generateReport(any(), any())).thenReturn(dto);

        CreateReportRequest request = new CreateReportRequest();
        request.setInvestigationId(investigationId);

        mockMvc.perform(post("/api/v1/reports").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt().jwt(j -> j.subject("123e4567-e89b-12d3-a456-426614174000")))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Test Report"));
    }

    @Test
    void getAllReports_shouldReturn200() throws Exception {
        ReportDto dto = ReportDto.builder()
                .id(reportId).investigationId(investigationId).title("Report 1").build();
        when(reportService.getAllReports()).thenReturn(List.of(dto));

        mockMvc.perform(get("/api/v1/reports").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt().jwt(j -> j.subject("123e4567-e89b-12d3-a456-426614174000"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].title").value("Report 1"));
    }

    @Test
    void getReportById_shouldReturn200() throws Exception {
        ReportDto dto = ReportDto.builder()
                .id(reportId).investigationId(investigationId).title("Single Report").build();
        when(reportService.getReportById(reportId)).thenReturn(dto);

        mockMvc.perform(get("/api/v1/reports/" + reportId).with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt().jwt(j -> j.subject("123e4567-e89b-12d3-a456-426614174000"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Single Report"));
    }

    @Test
    void downloadReport_shouldReturnPdf() throws Exception {
        String base64Pdf = Base64.getEncoder().encodeToString("fake-pdf-content".getBytes());
        ReportDto dto = ReportDto.builder()
                .id(reportId).investigationId(investigationId).content(base64Pdf).build();
        when(reportService.getReportById(reportId)).thenReturn(dto);

        mockMvc.perform(get("/api/v1/reports/" + reportId + "/download").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt().jwt(j -> j.subject("123e4567-e89b-12d3-a456-426614174000"))))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition",
                        "attachment; filename=\"report_" + reportId + ".pdf\""))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF));
    }
}






