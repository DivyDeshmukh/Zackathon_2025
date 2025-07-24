package com.Leaz.contract.domain;

import java.util.List;

/**
 * Represents a parsed contract document with its clauses.
 */
public class ContractDocument {
    private String fileName;
    private String fullText;
    private List<ContractClause> clauses;
    private int totalWords;

    public ContractDocument() {}

    public ContractDocument(String fileName, String fullText, List<ContractClause> clauses) {
        this.fileName = fileName;
        this.fullText = fullText;
        this.clauses = clauses;
        this.totalWords = countWords(fullText);
    }

    private int countWords(String text) {
        if (text == null || text.trim().isEmpty()) {
            return 0;
        }
        return text.trim().split("\\s+").length;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFullText() {
        return fullText;
    }

    public void setFullText(String fullText) {
        this.fullText = fullText;
        this.totalWords = countWords(fullText);
    }

    public List<ContractClause> getClauses() {
        return clauses;
    }

    public void setClauses(List<ContractClause> clauses) {
        this.clauses = clauses;
    }

    public int getTotalWords() {
        return totalWords;
    }

    public void setTotalWords(int totalWords) {
        this.totalWords = totalWords;
    }
}