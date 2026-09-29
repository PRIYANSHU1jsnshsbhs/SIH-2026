package in.sih.vaspattribution.blockchain.provider;

import in.sih.vaspattribution.common.exception.BusinessException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class BlockchainProviderRegistry {

    private final List<BlockchainProvider> providers;

    public BlockchainProviderRegistry(List<BlockchainProvider> providers) {
        this.providers = providers;
    }

    public BlockchainProvider getProvider(String chain) {
        return providers.stream()
                .filter(provider -> provider.supports(chain))
                .findFirst()
                .orElseThrow(() -> new BusinessException("UNSUPPORTED_CHAIN", "Chain '" + chain + "' is not supported."));
    }
}
