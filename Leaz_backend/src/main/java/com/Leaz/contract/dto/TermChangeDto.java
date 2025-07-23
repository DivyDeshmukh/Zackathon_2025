package com.Leaz.contract.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO representing changes to a specific legal term.
 */
public class TermChangeDto {
    @JsonProperty("term")
    private String term;

    @JsonProperty("oldClause")
    private String oldClause;

    @JsonProperty("newClause")
    private String newClause;

    @JsonProperty("impact")
    private String impact;

    @JsonProperty("wordChangePct")
    private double wordChangePct;

    public TermChangeDto() {}

    public TermChangeDto(String term, String oldClause, String newClause, String impact, double wordChangePct) {
        this.term = term;
        this.oldClause = oldClause;
        this.newClause = newClause;
        this.impact = impact;
        this.wordChangePct = wordChangePct;
    }

    public String getTerm() {
        return term;
    }

    public void setTerm(String term) {
        this.term = term;
    }

    public String getOldClause() {
        return oldClause;
    }

    public void setOldClause(String oldClause) {
        this.oldClause = oldClause;
    }

    public String getNewClause() {
        return newClause;
    }

    public void setNewClause(String newClause) {
        this.newClause = newClause;
    }

    public String getImpact() {
        return impact;
    }

    public void setImpact(String impact) {
        this.impact = impact;
    }

    public double getWordChangePct() {
        return wordChangePct;
    }

    public void setWordChangePct(double wordChangePct) {
        this.wordChangePct = wordChangePct;
    }
}