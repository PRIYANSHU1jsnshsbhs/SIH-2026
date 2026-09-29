package in.sih.vaspattribution.cases.controller;

import in.sih.vaspattribution.cases.dto.AddWalletRequest;
import in.sih.vaspattribution.cases.dto.CaseDto;
import in.sih.vaspattribution.cases.dto.CaseWalletDto;
import in.sih.vaspattribution.cases.dto.CreateCaseRequest;
import in.sih.vaspattribution.cases.service.CaseService;
import in.sih.vaspattribution.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
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
@RequestMapping("/api/v1/cases")
@RequiredArgsConstructor
public class CaseController {

    private final CaseService caseService;

    @PostMapping
    public ResponseEntity<ApiResponse<CaseDto>> createCase(
            @Valid @RequestBody CreateCaseRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        UUID currentUserId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(ApiResponse.success(caseService.createCase(request, currentUserId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CaseDto>>> getAllCases(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(caseService.getAllCases(pageable)));
    }

    @GetMapping("/{caseId}")
    public ResponseEntity<ApiResponse<CaseDto>> getCaseById(@PathVariable UUID caseId) {
        return ResponseEntity.ok(ApiResponse.success(caseService.getCaseById(caseId)));
    }

    @PatchMapping("/{caseId}")
    public ResponseEntity<ApiResponse<CaseDto>> updateCase(
            @PathVariable UUID caseId,
            @Valid @RequestBody in.sih.vaspattribution.cases.dto.UpdateCaseRequest request) {
        return ResponseEntity.ok(ApiResponse.success(caseService.updateCase(caseId, request)));
    }


    @PostMapping("/{caseId}/wallets")
    public ResponseEntity<ApiResponse<CaseWalletDto>> addWalletToCase(
            @PathVariable UUID caseId,
            @Valid @RequestBody AddWalletRequest request) {
        return ResponseEntity.ok(ApiResponse.success(caseService.addWalletToCase(caseId, request)));
    }

    @GetMapping("/{caseId}/wallets")
    public ResponseEntity<ApiResponse<List<CaseWalletDto>>> getWalletsByCaseId(@PathVariable UUID caseId) {
        return ResponseEntity.ok(ApiResponse.success(caseService.getWalletsByCaseId(caseId)));
    }
}
