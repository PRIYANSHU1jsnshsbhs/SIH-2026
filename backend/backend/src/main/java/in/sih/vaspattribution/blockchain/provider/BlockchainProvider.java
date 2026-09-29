package in.sih.vaspattribution.blockchain.provider;

import in.sih.vaspattribution.blockchain.dto.BlockchainTransaction;
import in.sih.vaspattribution.blockchain.dto.TransactionQuery;
import in.sih.vaspattribution.blockchain.dto.WalletData;

import java.util.List;

public interface BlockchainProvider {
    WalletData getWallet(String address);

    List<BlockchainTransaction> getTransactions(String address, TransactionQuery query);

    BlockchainTransaction getTransaction(String txHash);

    boolean supports(String chain);
}
