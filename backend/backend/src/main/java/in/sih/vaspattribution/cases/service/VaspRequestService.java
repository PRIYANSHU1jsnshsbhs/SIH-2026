package in.sih.vaspattribution.cases.service;

import in.sih.vaspattribution.auth.entity.User;
import in.sih.vaspattribution.auth.repository.UserRepository;
import in.sih.vaspattribution.cases.dto.CreateVaspRequestDto;
import in.sih.vaspattribution.cases.dto.VaspRequestDto;
import in.sih.vaspattribution.cases.entity.Case;
import in.sih.vaspattribution.cases.entity.VaspRequest;
import in.sih.vaspattribution.cases.repository.CaseRepository;
import in.sih.vaspattribution.cases.repository.VaspRequestRepository;
import in.sih.vaspattribution.common.exception.ResourceNotFoundException;
import in.sih.vaspattribution.entity.entity.VaspEntity;
import in.sih.vaspattribution.entity.repository.VaspEntityRepository;
import in.sih.vaspattribution.investigation.entity.Investigation;
import in.sih.vaspattribution.investigation.repository.InvestigationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VaspRequestService {

    private final VaspRequestRepository vaspRequestRepository;
    private final CaseRepository caseRepository;
    private final VaspEntityRepository vaspEntityRepository;
    private final InvestigationRepository investigationRepository;
    private final UserRepository userRepository;

    @Transactional
    public VaspRequestDto createVaspRequest(UUID caseId, CreateVaspRequestDto requestDto, UUID currentUserId) {
        Case aCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case", "id", caseId));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        VaspEntity entity = vaspEntityRepository.findById(requestDto.getEntityId())
                .orElseThrow(() -> new ResourceNotFoundException("VaspEntity", "id", requestDto.getEntityId()));

        Investigation investigation = null;
        if (requestDto.getInvestigationId() != null) {
            investigation = investigationRepository.findById(requestDto.getInvestigationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Investigation", "id", requestDto.getInvestigationId()));
        }

        VaspRequest request = new VaspRequest();
        request.setId(UUID.randomUUID());
        request.setACase(aCase);
        request.setInvestigation(investigation);
        request.setEntity(entity);
        request.setRequestType(requestDto.getRequestType());
        request.setNotes(requestDto.getNotes());
        request.setStatus("DRAFT");
        request.setCreatedBy(user);

        VaspRequest saved = vaspRequestRepository.save(request);
        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<VaspRequestDto> getVaspRequestsByCaseId(UUID caseId) {
        return vaspRequestRepository.findByaCaseId(caseId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private VaspRequestDto mapToDto(VaspRequest request) {
        return VaspRequestDto.builder()
                .id(request.getId())
                .caseId(request.getACase().getId())
                .investigationId(request.getInvestigation() != null ? request.getInvestigation().getId() : null)
                .entityId(request.getEntity().getId())
                .entityName(request.getEntity().getName())
                .requestType(request.getRequestType())
                .status(request.getStatus())
                .notes(request.getNotes())
                .createdBy(request.getCreatedBy() != null ? request.getCreatedBy().getId() : null)
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }
}
