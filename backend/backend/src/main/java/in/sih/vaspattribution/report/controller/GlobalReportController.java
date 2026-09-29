package in.sih.vaspattribution.report.controller;

import in.sih.vaspattribution.common.ApiResponse;
import in.sih.vaspattribution.report.dto.CreateReportRequest;
import in.sih.vaspattribution.report.dto.ReportDto;
import in.sih.vaspattribution.report.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
@Tag(name = "Global Reports", description = "PRD-compliant API for generating and downloading investigation reports")
public class GlobalReportController {

    private final ReportService reportService;

    @PostMapping
    @Operation(summary = "Generate Report", description = "Generates a PDF report for an investigation")
    public ResponseEntity<ApiResponse<ReportDto>> generateReport(
            @Valid @RequestBody CreateReportRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        UUID currentUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(ApiResponse.success(reportService.generateReport(request.getInvestigationId(), currentUserId)));
    }

    @GetMapping
    @Operation(summary = "Get All Reports", description = "Retrieves all reports")
    public ResponseEntity<ApiResponse<List<ReportDto>>> getAllReports() {
        return ResponseEntity.ok(ApiResponse.success(reportService.getAllReports()));
    }

    @GetMapping("/{reportId}")
    @Operation(summary = "Get Report by ID", description = "Retrieves a specific report")
    public ResponseEntity<ApiResponse<ReportDto>> getReportById(@PathVariable UUID reportId) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getReportById(reportId)));
    }

    @GetMapping("/{reportId}/download")
    @Operation(summary = "Download Report", description = "Downloads the PDF report")
    public ResponseEntity<byte[]> downloadReport(@PathVariable UUID reportId) {
        ReportDto report = reportService.getReportById(reportId);
        
        if (report == null || report.getContent() == null) {
            return ResponseEntity.notFound().build();
        }

        byte[] pdfBytes = Base64.getDecoder().decode(report.getContent());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"report_" + reportId + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }
}
