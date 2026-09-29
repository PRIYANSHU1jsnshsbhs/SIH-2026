package in.sih.vaspattribution.report.service;

import com.itextpdf.text.Document;
import com.itextpdf.text.Paragraph;
import com.itextpdf.text.pdf.PdfWriter;
import in.sih.vaspattribution.auth.entity.User;
import in.sih.vaspattribution.auth.repository.UserRepository;
import in.sih.vaspattribution.common.exception.ResourceNotFoundException;
import in.sih.vaspattribution.investigation.entity.Finding;
import in.sih.vaspattribution.finding.repository.FindingRepository;
import in.sih.vaspattribution.investigation.entity.Investigation;
import in.sih.vaspattribution.investigation.repository.InvestigationRepository;
import in.sih.vaspattribution.report.dto.ReportDto;
import in.sih.vaspattribution.report.entity.Report;
import in.sih.vaspattribution.report.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final InvestigationRepository investigationRepository;
    private final UserRepository userRepository;
    private final FindingRepository findingRepository;

    public ReportDto generateReport(UUID investigationId, UUID currentUserId) {
        Investigation investigation = investigationRepository.findById(investigationId)
                .orElseThrow(() -> new ResourceNotFoundException("Investigation", "id", investigationId));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        List<Finding> findings = findingRepository.findByInvestigationId(investigationId);

        String base64Pdf = "";
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);
            document.open();
            
            document.add(new Paragraph("VASP Attribution Investigation Report"));
            document.add(new Paragraph("Investigation ID: " + investigation.getId()));
            document.add(new Paragraph("Case ID: " + investigation.getACase().getId()));
            document.add(new Paragraph("Status: " + investigation.getStatus()));
            document.add(new Paragraph("Nodes Analyzed: " + investigation.getNodesFound()));
            document.add(new Paragraph("Edges Analyzed: " + investigation.getEdgesFound()));
            document.add(new Paragraph(" "));
            document.add(new Paragraph("Findings:"));
            
            for (Finding finding : findings) {
                document.add(new Paragraph("- " + finding.getType() + " [" + finding.getSeverity() + "]: " + finding.getTitle()));
                document.add(new Paragraph("  Description: " + finding.getDescription()));
                document.add(new Paragraph("  Evidence: " + finding.getEvidence()));
            }
            
            document.close();
            base64Pdf = Base64.getEncoder().encodeToString(baos.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF", e);
        }
        
        Report report = new Report();
        report.setId(UUID.randomUUID());
        report.setInvestigation(investigation);
        report.setTitle("VASP Attribution Report for " + investigation.getId());
        report.setContent(base64Pdf);
        report.setCreatedBy(user);
        
        Report saved = reportRepository.save(report);

        return mapToDto(saved);
    }

    public List<ReportDto> getReportsByInvestigationId(UUID investigationId) {
        return reportRepository.findByInvestigationId(investigationId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<ReportDto> getAllReports() {
        return reportRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public ReportDto getReportById(UUID reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report", "id", reportId));
        return mapToDto(report);
    }

    private ReportDto mapToDto(Report report) {
        return ReportDto.builder()
                .id(report.getId())
                .investigationId(report.getInvestigation().getId())
                .title(report.getTitle())
                .content(report.getContent()) // Base64 PDF
                .createdBy(report.getCreatedBy() != null ? report.getCreatedBy().getId() : null)
                .createdAt(report.getCreatedAt())
                .build();
    }
}
