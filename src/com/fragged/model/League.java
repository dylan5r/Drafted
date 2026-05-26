package com.fragged.model;

import java.io.Serializable;
import java.sql.Timestamp;

public class League implements Serializable {

    private long id;
    private Long ownerUserId;
    private String name;
    private String description;
    private String game;
    private String visibility;
    private String leagueType;
    private String inviteCode;
    private double entryFee;
    private int salaryCap;
    private String customRulesJson;
    private Timestamp startsAt;
    private Timestamp endsAt;
    private String status;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public Long getOwnerUserId() {
        return ownerUserId;
    }

    public void setOwnerUserId(Long ownerUserId) {
        this.ownerUserId = ownerUserId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getGame() {
        return game;
    }

    public void setGame(String game) {
        this.game = game;
    }

    public String getVisibility() {
        return visibility;
    }

    public void setVisibility(String visibility) {
        this.visibility = visibility;
    }

    public String getLeagueType() {
        return leagueType;
    }

    public void setLeagueType(String leagueType) {
        this.leagueType = leagueType;
    }

    public String getInviteCode() {
        return inviteCode;
    }

    public void setInviteCode(String inviteCode) {
        this.inviteCode = inviteCode;
    }

    public double getEntryFee() {
        return entryFee;
    }

    public void setEntryFee(double entryFee) {
        this.entryFee = entryFee;
    }

    public int getSalaryCap() {
        return salaryCap;
    }

    public void setSalaryCap(int salaryCap) {
        this.salaryCap = salaryCap;
    }

    public String getCustomRulesJson() {
        return customRulesJson;
    }

    public void setCustomRulesJson(String customRulesJson) {
        this.customRulesJson = customRulesJson;
    }

    public Timestamp getStartsAt() {
        return startsAt;
    }

    public void setStartsAt(Timestamp startsAt) {
        this.startsAt = startsAt;
    }

    public Timestamp getEndsAt() {
        return endsAt;
    }

    public void setEndsAt(Timestamp endsAt) {
        this.endsAt = endsAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
    }
}
