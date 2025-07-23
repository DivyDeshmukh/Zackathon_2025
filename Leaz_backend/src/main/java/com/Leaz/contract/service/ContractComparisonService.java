package com.Leaz.contract;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class ContractComparisonService {

    private final FileParser fileParser;
    private final LLMClient llmClient;

    /**
     * Compare two contracts and return structured JSON response.
     */
    public CompareResponse compare(MultipartFile oldFile, MultipartFile newFile) throws IOException {
        // 1. Parse each file to text
        String oldText = fileParser.parse(oldFile);
        String newText = fileParser.parse(newFile);

        // 2. Truncate to 700 words each
        oldText = truncateToWords(oldText, 700);
        newText = truncateToWords(newText, 700);

        // 3. Build LLM prompt with few‑shot & CoT
        String prompt = buildPrompt(oldText, newText);

        // 4. Call Gemini (or other LLM) via llmClient
        CompareResponse compareResponse = llmClient.generateComparison(prompt);

        // 5. Map JSON to CompareResponse DTO
       return compareResponse;
    }

    private String truncateToWords(String text, int maxWords) {
        String[] words = text.split("\\s+");
        if (words.length <= maxWords) return text;
        return Stream.of(words)
                     .limit(maxWords)
                     .collect(Collectors.joining(" ")) + "...";
    }

    public String buildPrompt(String oldText, String newText) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are a high-accuracy legal AI assistant. Given two contracts—")
        .append("one \"Old\" and one \"New\"—you must:\n")
        .append("1. Identify all legal terms present, tagging each with section or clause ID.\n")
        .append("2. For each term, extract old vs. new clause text, compute word-change %, ")
        .append("and label impact: \"Minor\" (<30%), \"Moderate\" (30–60%), or \"Major\" (>60%).\n")
        .append("3. Auto-generate clause IDs from section headings if none exist.\n")
        .append("4. Output JSON only, with keys: termChanges, clauseChanges, ")
        .append("overallChangePct, overallSummary.\n\n")
        .append("### Old Contract Text (first 700 words):\n")
        .append(oldText).append("\n\n")
        .append("### New Contract Text (first 700 words):\n")
        .append(newText).append("\n\n")
        .append("Respond with **only** valid JSON matching this schema (no markdown fences, no extra text):\n")
        .append("{\n")
        .append("  \"termChanges\": [{\"term\":\"...\",\"sectionOrClauseId\":\"...\",\"oldClause\":\"...\",\"newClause\":\"...\",\"impact\":\"...\",\"wordChangePct\":0}],\n")
        .append("  \"clauseChanges\": [{\"clauseId\":\"...\",\"oldText\":\"...\",\"newText\":\"...\",\"wordChangePct\":0}],\n")
        .append("  \"overallChangePct\": 0,\n")
        .append("  \"overallSummary\": \"...\"\n")
        .append("}");
        return sb.toString();
    }

}
