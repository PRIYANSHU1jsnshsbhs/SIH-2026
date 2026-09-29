package in.sih.vaspattribution.risk.controller;

import in.sih.vaspattribution.common.ApiResponse;
import in.sih.vaspattribution.risk.dto.RiskScoreDto;
import in.sih.vaspattribution.risk.service.RiskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import in.sih.vaspattribution.risk.dto.RiskWalletRequest;

@RestController
@RequestMapping("/api/v1/risk")
@RequiredArgsConstructor
public class RiskController {

    private final RiskService riskService;

    @GetMapping("/scores/{chain}/{address}")
    public ResponseEntity<ApiResponse<RiskScoreDto>> getRiskScore(
            @PathVariable String chain,
            @PathVariable String address) {
        return ResponseEntity.ok(ApiResponse.success(riskService.getRiskScore(chain, address)));
    }

    @PostMapping("/wallet")
    public ResponseEntity<ApiResponse<RiskScoreDto>> assessWalletRisk(
            @RequestBody RiskWalletRequest request) {
        return ResponseEntity.ok(ApiResponse.success(riskService.getRiskScore(request.getChain(), request.getAddress())));
    }
}
