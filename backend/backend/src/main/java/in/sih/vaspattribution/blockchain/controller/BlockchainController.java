package in.sih.vaspattribution.blockchain.controller;

import in.sih.vaspattribution.blockchain.dto.BlockchainTransaction;
import in.sih.vaspattribution.blockchain.dto.TransactionQuery;
import in.sih.vaspattribution.blockchain.dto.WalletData;
import in.sih.vaspattribution.blockchain.provider.BlockchainProvider;
import in.sih.vaspattribution.blockchain.provider.BlockchainProviderRegistry;
import in.sih.vaspattribution.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BlockchainController {

    private final BlockchainProviderRegistry providerRegistry;

    @GetMapping("/wallets/{chain}/{address}")
    public ResponseEntity<ApiResponse<WalletData>> getWallet(
            @PathVariable String chain,
            @PathVariable String address) {
        BlockchainProvider provider = providerRegistry.getProvider(chain);
        return ResponseEntity.ok(ApiResponse.success(provider.getWallet(address)));
    }

    @GetMapping("/wallets/{chain}/{address}/statistics")
    public ResponseEntity<ApiResponse<WalletData>> getWalletStatistics(
            @PathVariable String chain,
            @PathVariable String address) {
        BlockchainProvider provider = providerRegistry.getProvider(chain);
        return ResponseEntity.ok(ApiResponse.success(provider.getWallet(address)));
    }

    @GetMapping("/wallets/{chain}/{address}/transactions")
    public ResponseEntity<ApiResponse<List<BlockchainTransaction>>> getTransactions(
            @PathVariable String chain,
            @PathVariable String address,
            TransactionQuery query) {
        BlockchainProvider provider = providerRegistry.getProvider(chain);
        return ResponseEntity.ok(ApiResponse.success(provider.getTransactions(address, query)));
    }

    @GetMapping("/transactions/{chain}/{txHash}")
    public ResponseEntity<ApiResponse<BlockchainTransaction>> getTransaction(
            @PathVariable String chain,
            @PathVariable String txHash) {
        BlockchainProvider provider = providerRegistry.getProvider(chain);
        return ResponseEntity.ok(ApiResponse.success(provider.getTransaction(txHash)));
    }
}
