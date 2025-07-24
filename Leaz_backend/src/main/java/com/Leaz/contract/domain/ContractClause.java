package com.Leaz.contract.domain;

import java.util.Set;

/**
 * Represents a clause within a contract document.
 */
public class ContractClause {
    private String clauseId;
    private String text;
    private Set<String> legalTerms;
    private int startPosition;
    private int endPosition;

    public ContractClause() {}

    public ContractClause(String clauseId, String text, Set<String> legalTerms, int startPosition, int endPosition) {
        this.clauseId = clauseId;
        this.text = text;
        this.legalTerms = legalTerms;
        this.startPosition = startPosition;
        this.endPosition = endPosition;
    }

    public String getClauseId() {
        return clauseId;
    }

    public void setClauseId(String clauseId) {
        this.clauseId = clauseId;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Set<String> getLegalTerms() {
        return legalTerms;
    }

    public void setLegalTerms(Set<String> legalTerms) {
        this.legalTerms = legalTerms;
    }

    public int getStartPosition() {
        return startPosition;
    }

    public void setStartPosition(int startPosition) {
        this.startPosition = startPosition;
    }

    public int getEndPosition() {
        return endPosition;
    }

    public void setEndPosition(int endPosition) {
        this.endPosition = endPosition;
    }

    @Override
    public String toString() {
        return "ContractClause{" +
                "clauseId='" + clauseId + '\'' +
                ", text='" + text.substring(0, Math.min(50, text.length())) + "...'" +
                ", legalTerms=" + legalTerms +
                '}';
    }
}