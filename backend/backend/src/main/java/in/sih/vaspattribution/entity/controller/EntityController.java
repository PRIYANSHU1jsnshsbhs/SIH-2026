package in.sih.vaspattribution.entity.controller;

import in.sih.vaspattribution.entity.dto.EntityResponse;
import in.sih.vaspattribution.entity.service.EntityService;
import in.sih.vaspattribution.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/entities")
@RequiredArgsConstructor
public class EntityController {

    private final EntityService entityService;

    @GetMapping("/address/{chain}/{address}")
    public ResponseEntity<ApiResponse<EntityResponse>> getEntityByAddress(
            @PathVariable String chain,
            @PathVariable String address) {
        return ResponseEntity.ok(ApiResponse.success(entityService.findByAddress(chain, address)));
    }
}
