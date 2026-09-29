package in.sih.vaspattribution.finding.service;

import in.sih.vaspattribution.finding.dto.FindingDto;
import in.sih.vaspattribution.investigation.entity.Finding;
import in.sih.vaspattribution.finding.repository.FindingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FindingService {

    private final FindingRepository findingRepository;

    public List<FindingDto> getFindingsByInvestigationId(UUID investigationId) {
        return findingRepository.findByInvestigationId(investigationId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private FindingDto mapToDto(Finding finding) {
        return FindingDto.builder()
                .id(finding.getId())
                .investigationId(finding.getInvestigation().getId())
                .type(finding.getType())
                .title(finding.getTitle())
                .description(finding.getDescription())
                .severity(finding.getSeverity())
                .evidence(finding.getEvidence())
                .createdAt(finding.getCreatedAt())
                .build();
    }
}
