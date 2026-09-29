package in.sih.vaspattribution.finding.controller;

import in.sih.vaspattribution.common.ApiResponse;
import in.sih.vaspattribution.finding.dto.FindingDto;
import in.sih.vaspattribution.finding.service.FindingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/investigations/{investigationId}/findings")
@RequiredArgsConstructor
public class FindingController {

    private final FindingService findingService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FindingDto>>> getFindingsByInvestigationId(
            @PathVariable UUID investigationId) {
        return ResponseEntity.ok(ApiResponse.success(findingService.getFindingsByInvestigationId(investigationId)));
    }
}
