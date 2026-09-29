package in.sih.vaspattribution.investigation.controller;

import in.sih.vaspattribution.common.ApiResponse;
import in.sih.vaspattribution.investigation.dto.CreateInvestigationRequest;
import in.sih.vaspattribution.investigation.dto.InvestigationDto;
import in.sih.vaspattribution.investigation.dto.InvestigationResponse;
import in.sih.vaspattribution.investigation.dto.FindingDto;
import in.sih.vaspattribution.investigation.service.InvestigationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class InvestigationController {

    private final InvestigationService investigationService;

    @PostMapping("/investigations")
    public ResponseEntity<ApiResponse<InvestigationDto>> createInvestigation(
            @Valid @RequestBody CreateInvestigationRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        UUID currentUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(ApiResponse.success(investigationService.createInvestigation(request.getCaseId(), request, currentUserId)));
    }

    @GetMapping("/cases/{caseId}/investigations")
    public ResponseEntity<ApiResponse<Page<InvestigationDto>>> getInvestigationsByCaseId(
            @PathVariable UUID caseId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(investigationService.getInvestigationsByCaseId(caseId, pageable)));
    }

    @GetMapping("/investigations/{investigationId}")
    public ResponseEntity<ApiResponse<InvestigationDto>> getInvestigationStatus(
            @PathVariable UUID investigationId) {
        return ResponseEntity.ok(ApiResponse.success(investigationService.getInvestigationStatus(investigationId)));
    }

    @GetMapping("/investigations/{investigationId}/graph")
    public ResponseEntity<ApiResponse<InvestigationResponse>> getInvestigationGraph(
            @PathVariable UUID investigationId) {
        return ResponseEntity.ok(ApiResponse.success(investigationService.getInvestigationGraph(investigationId)));
    }

    @PostMapping("/investigations/{investigationId}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelInvestigation(
            @PathVariable UUID investigationId) {
        investigationService.cancelInvestigation(investigationId);
        return ResponseEntity.ok(ApiResponse.success(null, "Investigation cancelled successfully"));
    }

    @GetMapping("/investigations/{investigationId}/attribution")
    public ResponseEntity<ApiResponse<List<in.sih.vaspattribution.investigation.dto.AttributionDto>>> getAttribution(
            @PathVariable UUID investigationId) {
        return ResponseEntity.ok(ApiResponse.success(investigationService.getAttributionByInvestigationId(investigationId)));
    }
}
