package com.Leaz.contract.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * DTO representing changes to a specific clause.
 */
public class ClauseChangeDto {
    @JsonProperty("clauseId")
    private String clauseId;

    @JsonProperty("oldText")
    private String oldText;

    @JsonProperty("newText")
    private String newText;

    @JsonProperty("wordChangePct")
    private double wordChangePct;

    public ClauseChangeDto() {}

    public ClauseChangeDto(String clauseId, String oldText, String newText, double wordChangePct) {
        this.clauseId = clauseId;
        this.oldText = oldText;
        this.newText = newText;
        this.wordChangePct = wordChangePct;
    }

    public String getClauseId() {
        return clauseId;
    }

    public void setClauseId(String clauseId) {
        this.clauseId = clauseId;
    }
 
    public String getOldText() {
        return oldText;
    }

    public void setOldText(String oldText) {
        this.oldText = oldText;
    }

    public String getNewText() {
        return newText;
    }

    public void setNewText(String newText) {
        this.newText = newText;
    }

    public double getWordChangePct() {
        return wordChangePct;
    }

    public void setWordChangePct(double wordChangePct) {
        this.wordChangePct = wordChangePct;
    }
}
