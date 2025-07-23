package com.Leaz.contract;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import com.fasterxml.jackson.databind.DeserializationFeature;

import java.io.IOException;
import java.util.List;

@Data
public class CompareResponse {
    private List<TermChange> termChanges;
    private List<ClauseChange> clauseChanges;
    private double overallChangePct;
    private String overallSummary;

    public static CompareResponse fromJson(String json) {
        try {
            // 1. Strip fences & isolate the {...}
            String cleanedJson = cleanJsonResponse(json);
            // 2. Remove any remaining control chars (including \u0000)
            cleanedJson = cleanedJson.replaceAll("\\p{Cntrl}", "");
            // 3. Configure ObjectMapper to be more lenient
            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            mapper.configure(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT, true);
            // 4. Deserialize
            return mapper.readValue(cleanedJson, CompareResponse.class);
        } catch (IOException e) {
            // Provide more detailed error information
            throw new RuntimeException("Failed to parse LLM JSON response. Raw response (first 500 chars): " 
                + (json.length() > 500 ? json.substring(0, 500) + "..." : json) + ". Error: " + e.getMessage(), e);
        } catch (RuntimeException e) {
            // Re-throw runtime exceptions from cleaning process
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Unexpected error processing LLM JSON response: " + e.getMessage(), e);
        }
    }

    private static String cleanJsonResponse(String json) {
        if (json == null || json.trim().isEmpty()) {
            throw new RuntimeException("Empty or null JSON response from LLM");
        }
        
        // Remove common markdown code fence artifacts more robustly
        String cleaned = json.trim();
        
        // Handle various markdown code fence patterns
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7).trim();
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3).trim();
        }
        
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3).trim();
        }
        
        // Remove any additional text before/after JSON
        int firstBrace = cleaned.indexOf('{');
        int lastBrace = cleaned.lastIndexOf('}');
        
        if (firstBrace == -1 || lastBrace == -1 || firstBrace >= lastBrace) {
            throw new RuntimeException("No valid JSON object found in LLM response. Content: " + 
                (cleaned.length() > 100 ? cleaned.substring(0, 100) + "..." : cleaned));
        }
        
        String result = cleaned.substring(firstBrace, lastBrace + 1);
        
        // Basic validation - check if it looks like valid JSON structure
        if (!result.contains("\"termChanges\"") || !result.contains("\"overallSummary\"")) {
            throw new RuntimeException("JSON missing required fields. Extracted: " + 
                (result.length() > 200 ? result.substring(0, 200) + "..." : result));
        }
        
        return result;
    }

    @Data
    public static class TermChange {
        private String term;
        private String sectionOrClauseId;
        private String oldClause;
        private String newClause;
        private String impact;
        private double wordChangePct;
    }

    @Data
    public static class ClauseChange {
        private String clauseId;
        private String oldText;
        private String newText;
        private double wordChangePct;
    }
}
