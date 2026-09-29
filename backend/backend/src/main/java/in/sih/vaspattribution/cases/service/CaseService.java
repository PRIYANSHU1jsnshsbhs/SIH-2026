package in.sih.vaspattribution.cases.service;

import in.sih.vaspattribution.auth.entity.User;
import in.sih.vaspattribution.auth.repository.UserRepository;
import in.sih.vaspattribution.cases.dto.AddWalletRequest;
import in.sih.vaspattribution.cases.dto.CaseDto;
import in.sih.vaspattribution.cases.dto.CaseWalletDto;
import in.sih.vaspattribution.cases.dto.CreateCaseRequest;
import in.sih.vaspattribution.cases.entity.Case;
import in.sih.vaspattribution.cases.entity.CaseWallet;
import in.sih.vaspattribution.cases.repository.CaseRepository;
import in.sih.vaspattribution.cases.repository.CaseWalletRepository;
import in.sih.vaspattribution.common.exception.BusinessException;
import in.sih.vaspattribution.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CaseService {

    private final CaseRepository caseRepository;
    private final CaseWalletRepository caseWalletRepository;
    private final UserRepository userRepository;

    @Transactional
    public CaseDto createCase(CreateCaseRequest request, UUID currentUserId) {
        if (caseRepository.findByCaseNumber(request.getCaseNumber()).isPresent()) {
            throw new BusinessException("CASE_NUMBER_EXISTS", "Case number already exists");
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        Case aCase = new Case();
        aCase.setId(UUID.randomUUID());
        aCase.setCaseNumber(request.getCaseNumber());
        aCase.setTitle(request.getTitle());
        aCase.setDescription(request.getDescription());
        aCase.setPriority(request.getPriority());
        aCase.setStatus("OPEN");
        aCase.setCreatedBy(user);

        Case savedCase = caseRepository.save(aCase);
        return mapToDto(savedCase);
    }

    @Transactional(readOnly = true)
    public Page<CaseDto> getAllCases(Pageable pageable) {
        return caseRepository.findAll(pageable)
                .map(this::mapToDto);
    }

    public CaseDto getCaseById(UUID caseId) {
        Case aCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case", "id", caseId));
        return mapToDto(aCase);
    }

    @Transactional
    public CaseDto updateCase(UUID caseId, in.sih.vaspattribution.cases.dto.UpdateCaseRequest request) {
        Case aCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case", "id", caseId));
        
        if (request.getTitle() != null) {
            aCase.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            aCase.setDescription(request.getDescription());
        }
        if (request.getPriority() != null) {
            aCase.setPriority(request.getPriority());
        }
        if (request.getStatus() != null) {
            aCase.setStatus(request.getStatus());
        }
        
        Case updatedCase = caseRepository.save(aCase);
        return mapToDto(updatedCase);
    }


    @Transactional
    public CaseWalletDto addWalletToCase(UUID caseId, AddWalletRequest request) {
        Case aCase = caseRepository.findById(caseId)
                .orElseThrow(() -> new ResourceNotFoundException("Case", "id", caseId));

        if (caseWalletRepository.existsByaCaseIdAndChainAndAddress(caseId, request.getChain(), request.getAddress())) {
            throw new BusinessException("WALLET_EXISTS", "Wallet already exists in this case");
        }

        CaseWallet wallet = new CaseWallet();
        wallet.setId(UUID.randomUUID());
        wallet.setACase(aCase);
        wallet.setChain(request.getChain().toLowerCase());
        wallet.setAddress(request.getAddress());
        wallet.setLabel(request.getLabel());
        wallet.setSource(request.getSource());

        CaseWallet savedWallet = caseWalletRepository.save(wallet);
        return mapToDto(savedWallet);
    }

    public List<CaseWalletDto> getWalletsByCaseId(UUID caseId) {
        if (!caseRepository.existsById(caseId)) {
            throw new ResourceNotFoundException("Case", "id", caseId);
        }
        
        return caseWalletRepository.findByaCaseId(caseId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private CaseDto mapToDto(Case aCase) {
        return CaseDto.builder()
                .id(aCase.getId())
                .caseNumber(aCase.getCaseNumber())
                .title(aCase.getTitle())
                .description(aCase.getDescription())
                .priority(aCase.getPriority())
                .status(aCase.getStatus())
                .createdBy(aCase.getCreatedBy().getId())
                .createdAt(aCase.getCreatedAt())
                .updatedAt(aCase.getUpdatedAt())
                .build();
    }

    private CaseWalletDto mapToDto(CaseWallet wallet) {
        return CaseWalletDto.builder()
                .id(wallet.getId())
                .caseId(wallet.getACase().getId())
                .chain(wallet.getChain())
                .address(wallet.getAddress())
                .label(wallet.getLabel())
                .source(wallet.getSource())
                .createdAt(wallet.getCreatedAt())
                .build();
    }
}
