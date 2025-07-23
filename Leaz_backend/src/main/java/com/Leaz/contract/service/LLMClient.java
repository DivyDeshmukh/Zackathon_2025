package com.Leaz.contract;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // ✅ Fixed import
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class LLMClient {

    private final WebClient webClient;

    @Value("${gemini.endpoint}")
    private String endpoint;

    @Value("${gemini.api-key}")
    private String apiKey;

    @Value("${gemini.max-tokens}")
    private int maxTokens;

    @Value("${gemini.temperature}")
    private double temperature;

    public CompareResponse generateComparison(String prompt) {
        Map<String, Object> body = Map.of(
            "contents", List.of(
                Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", prompt))
                )
            ),
            "generationConfig", Map.of(
                "temperature", temperature,
            "maxOutputTokens", maxTokens
            )
        );

        String raw = webClient.post()
            .uri(endpoint)
            .header("X-Goog-Api-Key", apiKey)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(body)
            .retrieve()
            .bodyToMono(String.class)
            .timeout(Duration.ofSeconds(30))
            .block();

        log.debug("Raw Gemini API response: {}", raw);

        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(raw);

            if (root.has("error")) {
                String errorMsg = root.path("error").path("message").asText("Unknown API error");
                throw new RuntimeException("Gemini API error: " + errorMsg);
            }

            JsonNode textNode = root.path("candidates").path(0)
                                    .path("content").path("parts").path(0).path("text");

            if (textNode.isMissingNode()) {
                throw new RuntimeException("Gemini response missing candidates[0].content.parts[0].text: " + raw);
            }

            String extractedText = textNode.asText();
            log.debug("Extracted text from Gemini response: {}", extractedText);

            // ✅ Deserialize and return as object
            return CompareResponse.fromJson(extractedText);

        } catch (Exception e) {
            log.error("Failed to extract JSON from Gemini response: {}", raw, e);
            throw new RuntimeException("Failed to process Gemini response", e);
        }
    }
}
