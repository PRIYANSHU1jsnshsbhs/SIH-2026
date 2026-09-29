package in.sih.vaspattribution.blockchain.provider;

import in.sih.vaspattribution.blockchain.dto.BlockchainTransaction;
import in.sih.vaspattribution.blockchain.dto.TransactionQuery;
import in.sih.vaspattribution.blockchain.dto.WalletData;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Profile("dev | test")
public class DeterministicDevelopmentProvider implements BlockchainProvider {

    @Override
    public boolean supports(String chain) {
        return "ethereum".equalsIgnoreCase(chain);
    }

    @Override
    public WalletData getWallet(String address) {
        return WalletData.builder()
                .chain("ethereum")
                .address(address)
                .balance(new java.math.BigDecimal("100.0"))
                .transactionCount(10)
                .firstTxDate(OffsetDateTime.now().minusDays(100).toString())
                .lastTxDate(OffsetDateTime.now().toString())
                .build();
    }

    @Override
    public List<BlockchainTransaction> getTransactions(String address, TransactionQuery query) {
        List<BlockchainTransaction> txs = new ArrayList<>();
        
        if ("0xSTART".equalsIgnoreCase(address)) {
            txs.add(createTx("0xSTART", "0xA", new java.math.BigDecimal("10.0")));
            txs.add(createTx("0xSTART", "0xC", new java.math.BigDecimal("15.0")));
        } else if ("0xA".equalsIgnoreCase(address)) {
            txs.add(createTx("0xA", "0xB", new java.math.BigDecimal("9.0")));
        } else if ("0xB".equalsIgnoreCase(address)) {
            txs.add(createTx("0xB", "Exchange1", new java.math.BigDecimal("8.0")));
        } else if ("0xC".equalsIgnoreCase(address)) {
            txs.add(createTx("0xC", "Exchange2", new java.math.BigDecimal("14.0")));
        }
        
        return txs;
    }

    @Override
    public BlockchainTransaction getTransaction(String txHash) {
        return createTx("0xUNKNOWN", "0xUNKNOWN", java.math.BigDecimal.ZERO);
    }

    private BlockchainTransaction createTx(String from, String to, java.math.BigDecimal value) {
        return BlockchainTransaction.builder()
                .chain("ethereum")
                .txHash("0xTX_" + UUID.randomUUID().toString().substring(0, 8))
                .block(1234567L)
                .timestamp(OffsetDateTime.now())
                .fromAddress(from)
                .toAddress(to)
                .value(value)
                .asset("ETH")
                .status("SUCCESS")
                .tokenTransfers(List.of())
                .build();
    }
}
