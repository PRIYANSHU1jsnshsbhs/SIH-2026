package in.sih.vaspattribution.blockchain.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import in.sih.vaspattribution.blockchain.dto.BlockchainTransaction;
import in.sih.vaspattribution.blockchain.dto.TransactionQuery;
import in.sih.vaspattribution.blockchain.dto.WalletData;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.io.File;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@Primary
@RequiredArgsConstructor
public class DatasetBlockchainProvider implements BlockchainProvider {

    private final ObjectMapper objectMapper;
    private final Map<String, WalletData> nodeIndex = new ConcurrentHashMap<>();
    private final Map<String, List<BlockchainTransaction>> edgeIndex = new ConcurrentHashMap<>();
    private final Map<String, BlockchainTransaction> txIndex = new ConcurrentHashMap<>();

    @Value("${vaspattribution.dataset.path:../../crypto_mock_dataset.json}")
    private String datasetPath;

    @PostConstruct
    public void init() {
        log.info("Initializing DatasetBlockchainProvider from path: {}", datasetPath);
        File file = new File(datasetPath);
        if (!file.exists()) {
            file = new File("crypto_mock_dataset.json");
            if (!file.exists()) {
                file = new File("../../crypto_mock_dataset.json");
            }
        }
        log.info("Loading dataset from exact file path: {}", file.getAbsolutePath());
        
        try {
            JsonNode root = objectMapper.readTree(file);
            JsonNode nodes = root.get("nodes");
            
            for (JsonNode node : nodes) {
                String id = "node-" + node.get("id").asText();
                JsonNode features = node.get("features");
                
                WalletData wallet = WalletData.builder()
                        .chain("mock")
                        .address(id)
                        .balance(new BigDecimal(features.get("balance_usd").asText()))
                        .transactionCount((int) (features.get("num_tx_in").asDouble() + features.get("num_tx_out").asDouble()))
                        .build();
                nodeIndex.put(id, wallet);
                edgeIndex.put(id, new ArrayList<>());
            }
            
            JsonNode edges = root.get("edges");
            int edgeIndexCounter = 0;
            for (JsonNode edge : edges) {
                String sourceId = "node-" + edge.get("source").asText();
                String targetId = "node-" + edge.get("target").asText();
                BigDecimal amount = new BigDecimal(edge.get("amount").asText());
                long timestamp = (long) edge.get("timestamp").asDouble();
                String txHash = "mocktx-" + edgeIndexCounter++;
                
                BlockchainTransaction tx = BlockchainTransaction.builder()
                        .chain("mock")
                        .txHash(txHash)
                        .fromAddress(sourceId)
                        .toAddress(targetId)
                        .value(amount)
                        .asset("USDT")
                        .timestamp(OffsetDateTime.ofInstant(Instant.ofEpochSecond(timestamp), ZoneOffset.UTC))
                        .build();
                
                edgeIndex.get(sourceId).add(tx);
                txIndex.put(txHash, tx);
            }
            log.info("Loaded {} nodes and {} edges into memory", nodeIndex.size(), txIndex.size());
        } catch (Exception e) {
            log.error("Failed to load mock dataset", e);
        }
    }

    @Override
    public WalletData getWallet(String address) {
        return nodeIndex.getOrDefault(address, WalletData.builder()
                .chain("mock")
                .address(address)
                .balance(BigDecimal.ZERO)
                .transactionCount(0)
                .build());
    }

    @Override
    public List<BlockchainTransaction> getTransactions(String address, TransactionQuery query) {
        List<BlockchainTransaction> allTxs = edgeIndex.getOrDefault(address, Collections.emptyList());
        
        // Sorting by timestamp desc
        List<BlockchainTransaction> sorted = new ArrayList<>(allTxs);
        sorted.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        
        int page = query.getPage() != null ? query.getPage() : 1;
        int limit = query.getLimit() != null ? query.getLimit() : 50;
        
        int offset = (page - 1) * limit;
        if (offset >= sorted.size()) {
            return Collections.emptyList();
        }
        int end = Math.min(offset + limit, sorted.size());
        return sorted.subList(offset, end);
    }

    @Override
    public BlockchainTransaction getTransaction(String txHash) {
        return txIndex.get(txHash);
    }

    @Override
    public boolean supports(String chain) {
        return "mock".equalsIgnoreCase(chain);
    }
}
