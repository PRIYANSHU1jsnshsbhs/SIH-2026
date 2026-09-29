package in.sih.vaspattribution.controller;

import in.sih.vaspattribution.blockchain.controller.BlockchainController;
import in.sih.vaspattribution.blockchain.dto.BlockchainTransaction;
import in.sih.vaspattribution.blockchain.dto.WalletData;
import in.sih.vaspattribution.blockchain.provider.BlockchainProvider;
import in.sih.vaspattribution.blockchain.provider.BlockchainProviderRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.ContextConfiguration;
import in.sih.vaspattribution.VaspAttributionTestApp;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ContextConfiguration(classes = VaspAttributionTestApp.class)
@WebMvcTest(BlockchainController.class)

public class BlockchainControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BlockchainProviderRegistry providerRegistry;

    @MockitoBean
    private BlockchainProvider provider;

    @BeforeEach
    void setup() {
        when(providerRegistry.getProvider(anyString())).thenReturn(provider);
    }

    @Test
    void getWallet_shouldReturn200() throws Exception {
        WalletData data = WalletData.builder()
                .address("0xABC").chain("ethereum").balance(new java.math.BigDecimal("100.0")).build();
        when(provider.getWallet("0xABC")).thenReturn(data);

        mockMvc.perform(get("/api/v1/wallets/ethereum/0xABC").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt().jwt(j -> j.subject("123e4567-e89b-12d3-a456-426614174000"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.address").value("0xABC"));
    }

    @Test
    void getWalletStatistics_shouldReturn200() throws Exception {
        WalletData data = WalletData.builder()
                .address("0xABC").chain("ethereum").balance(new java.math.BigDecimal("50.0")).build();
        when(provider.getWallet("0xABC")).thenReturn(data);

        mockMvc.perform(get("/api/v1/wallets/ethereum/0xABC/statistics").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt().jwt(j -> j.subject("123e4567-e89b-12d3-a456-426614174000"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void getTransactions_shouldReturn200_withQueryParams() throws Exception {
        BlockchainTransaction tx = BlockchainTransaction.builder()
                .txHash("0xTX1").chain("ethereum").fromAddress("0xA").toAddress("0xB").value(new java.math.BigDecimal("10.0")).build();
        when(provider.getTransactions(eq("0xABC"), any())).thenReturn(List.of(tx));

        mockMvc.perform(get("/api/v1/wallets/ethereum/0xABC/transactions").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt().jwt(j -> j.subject("123e4567-e89b-12d3-a456-426614174000")))
                        .param("direction", "OUT")
                        .param("asset", "ETH")
                        .param("minValue", "1.0")
                        .param("page", "1")
                        .param("limit", "50"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].txHash").value("0xTX1"));
    }

    @Test
    void getTransaction_shouldReturn200() throws Exception {
        BlockchainTransaction tx = BlockchainTransaction.builder()
                .txHash("0xTX1").chain("ethereum").fromAddress("0xA").toAddress("0xB").value(new java.math.BigDecimal("10.0")).build();
        when(provider.getTransaction("0xTX1")).thenReturn(tx);

        mockMvc.perform(get("/api/v1/transactions/ethereum/0xTX1").with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt().jwt(j -> j.subject("123e4567-e89b-12d3-a456-426614174000"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.txHash").value("0xTX1"));
    }
}






