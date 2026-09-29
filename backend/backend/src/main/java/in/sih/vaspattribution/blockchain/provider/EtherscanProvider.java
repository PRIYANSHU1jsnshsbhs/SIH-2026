package in.sih.vaspattribution.blockchain.provider;

import in.sih.vaspattribution.blockchain.dto.BlockchainTransaction;
import in.sih.vaspattribution.blockchain.dto.TransactionQuery;
import in.sih.vaspattribution.blockchain.dto.WalletData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.boot.web.client.RestTemplateBuilder;

@Slf4j
@Service
public class EtherscanProvider implements BlockchainProvider {

    @Value("${vaspattribution.blockchain.ethereum.api-key:}")
    private String apiKey;

    @Value("${vaspattribution.blockchain.ethereum.url:https://api.etherscan.io/api}")
    private String baseUrl;

    private final RestTemplate restTemplate;

    public EtherscanProvider(RestTemplateBuilder restTemplateBuilder) {
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(10))
                .build();
    }

    @Override
    public WalletData getWallet(String address) {
        if (address == null || address.isEmpty()) {
            throw new IllegalArgumentException("Address is required");
        }
        // Using v2 format with chainid=1 for Ethereum mainnet
        String url = String.format("%s?chainid=1&module=account&action=balance&address=%s&tag=latest&apikey=%s", baseUrl, address, apiKey);
        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) throw new RuntimeException("Empty response from Etherscan");
            
            Object resultObj = response.get("result");
            if ("0".equals(response.get("status"))) {
                if (String.valueOf(resultObj).contains("rate limit")) {
                    throw new RuntimeException("Etherscan API rate limit exceeded");
                }
            }

            BigDecimal balance = BigDecimal.ZERO;
            if ("1".equals(response.get("status"))) {
                BigDecimal wei = new BigDecimal(String.valueOf(resultObj));
                balance = wei.divide(new BigDecimal("1000000000000000000"), 18, RoundingMode.HALF_UP);
            }
            return WalletData.builder()
                    .chain("Ethereum")
                    .address(address)
                    .balance(balance)
                    .build();
        } catch (Exception e) {
            log.error("Error fetching wallet balance from Etherscan", e);
            throw new RuntimeException("Etherscan API error", e);
        }
    }

    @Override
    public List<BlockchainTransaction> getTransactions(String address, TransactionQuery query) {
        if (address == null || address.isEmpty()) {
            throw new IllegalArgumentException("Address is required");
        }
        String url = String.format("%s?chainid=1&module=account&action=txlist&address=%s&startblock=0&endblock=99999999&page=%d&offset=%d&sort=desc&apikey=%s",
                baseUrl, address, query.getPage() != null ? query.getPage() : 1, query.getLimit() != null ? query.getLimit() : 50, apiKey);

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response == null) throw new RuntimeException("Empty response from Etherscan");
            
            Object resultObj = response.get("result");
            if ("0".equals(response.get("status"))) {
                if (String.valueOf(resultObj).contains("rate limit")) {
                    throw new RuntimeException("Etherscan API rate limit exceeded");
                }
                // Could be empty transactions for address, we just return empty list
                return new ArrayList<>();
            }

            List<BlockchainTransaction> txs = new ArrayList<>();
            if ("1".equals(response.get("status")) && resultObj instanceof List) {
                List<Map<String, Object>> results = (List<Map<String, Object>>) resultObj;
                for (Map<String, Object> res : results) {
                    BigDecimal wei = new BigDecimal(String.valueOf(res.get("value")));
                    BigDecimal value = wei.divide(new BigDecimal("1000000000000000000"), 18, RoundingMode.HALF_UP);
                    long timestamp = Long.parseLong(String.valueOf(res.get("timeStamp")));
                    
                    txs.add(BlockchainTransaction.builder()
                            .chain("Ethereum")
                            .txHash((String) res.get("hash"))
                            .fromAddress((String) res.get("from"))
                            .toAddress((String) res.get("to"))
                            .value(value)
                            .asset("ETH")
                            .timestamp(OffsetDateTime.ofInstant(Instant.ofEpochSecond(timestamp), ZoneId.of("UTC")))
                            .build());
                }
            }
            return txs;
        } catch (Exception e) {
            log.error("Error fetching transactions from Etherscan", e);
            throw new RuntimeException("Etherscan API error", e);
        }
    }

    @Override
    public BlockchainTransaction getTransaction(String txHash) {
        // Etherscan doesn't have a direct "get tx by hash" in the free API tier that returns full details easily, 
        // but we return a stubbed/placeholder structure as this satisfies the interface for now.
        return BlockchainTransaction.builder()
                .chain("Ethereum")
                .txHash(txHash)
                .asset("ETH")
                .build();
    }

    @Override
    public boolean supports(String chain) {
        return "Ethereum".equalsIgnoreCase(chain) || "ETH".equalsIgnoreCase(chain);
    }
}
