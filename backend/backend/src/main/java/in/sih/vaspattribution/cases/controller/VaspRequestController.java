package in.sih.vaspattribution.cases.controller;

import in.sih.vaspattribution.cases.dto.CreateVaspRequestDto;
import in.sih.vaspattribution.cases.dto.VaspRequestDto;
import in.sih.vaspattribution.cases.service.VaspRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import in.sih.vaspattribution.common.ApiResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cases/{caseId}/vasp-requests")
@RequiredArgsConstructor
@Tag(name = "VASP Requests", description = "API for generating requests to VASPs for law enforcement")
public class VaspRequestController {

    private final VaspRequestService vaspRequestService;

    @PostMapping
    @Operation(summary = "Create a new VASP request (DRAFT)", description = "Creates a draft VASP request associated with a case")
    public ResponseEntity<ApiResponse<VaspRequestDto>> createVaspRequest(
            @PathVariable UUID caseId,
            @Valid @RequestBody CreateVaspRequestDto request,
            @AuthenticationPrincipal Jwt jwt) {
        UUID currentUserId = UUID.fromString(jwt.getSubject());
        return new ResponseEntity<>(ApiResponse.success(vaspRequestService.createVaspRequest(caseId, request, currentUserId)), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get VASP requests by case ID", description = "Retrieves all VASP requests for a specific case")
    public ResponseEntity<ApiResponse<List<VaspRequestDto>>> getVaspRequestsByCaseId(@PathVariable UUID caseId) {
        return ResponseEntity.ok(ApiResponse.success(vaspRequestService.getVaspRequestsByCaseId(caseId)));
    }
}
