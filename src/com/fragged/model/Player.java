package com.fragged.model;

import java.io.Serializable;
import java.sql.Timestamp;

public class Player implements Serializable {

    private long id;
    private String game;
    private String externalPlayerId;
    private String handle;
    private String realName;
    private String teamName;
    private String region;
    private String roleName;
    private String agentOrSpecialty;
    private String rarity;
    private int salary;
    private double recentForm;
    private double projectedPoints;
    private String avatarUrl;
    private String status;
    private double valorantKills;
    private double valorantDeaths;
    private double valorantAssists;
    private double valorantAcs;
    private double valorantRoundWins;
    private double fortniteKills;
    private double fortniteAvgPlacement;
    private double fortniteSurvivalMinutes;
    private double fortniteObjectives;
    private double rocketGoals;
    private double rocketAssists;
    private double rocketSaves;
    private double rocketShots;
    private double rocketMvpRate;
    private double rocketBoostUsage;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public String getGame() {
        return game;
    }

    public void setGame(String game) {
        this.game = game;
    }

    public String getExternalPlayerId() {
        return externalPlayerId;
    }

    public void setExternalPlayerId(String externalPlayerId) {
        this.externalPlayerId = externalPlayerId;
    }

    public String getHandle() {
        return handle;
    }

    public void setHandle(String handle) {
        this.handle = handle;
    }

    public String getRealName() {
        return realName;
    }

    public void setRealName(String realName) {
        this.realName = realName;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getRoleName() {
        return roleName;
    }

    public void setRoleName(String roleName) {
        this.roleName = roleName;
    }

    public String getAgentOrSpecialty() {
        return agentOrSpecialty;
    }

    public void setAgentOrSpecialty(String agentOrSpecialty) {
        this.agentOrSpecialty = agentOrSpecialty;
    }

    public String getRarity() {
        return rarity;
    }

    public void setRarity(String rarity) {
        this.rarity = rarity;
    }

    public int getSalary() {
        return salary;
    }

    public void setSalary(int salary) {
        this.salary = salary;
    }

    public double getRecentForm() {
        return recentForm;
    }

    public void setRecentForm(double recentForm) {
        this.recentForm = recentForm;
    }

    public double getProjectedPoints() {
        return projectedPoints;
    }

    public void setProjectedPoints(double projectedPoints) {
        this.projectedPoints = projectedPoints;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public double getValorantKills() {
        return valorantKills;
    }

    public void setValorantKills(double valorantKills) {
        this.valorantKills = valorantKills;
    }

    public double getValorantDeaths() {
        return valorantDeaths;
    }

    public void setValorantDeaths(double valorantDeaths) {
        this.valorantDeaths = valorantDeaths;
    }

    public double getValorantAssists() {
        return valorantAssists;
    }

    public void setValorantAssists(double valorantAssists) {
        this.valorantAssists = valorantAssists;
    }

    public double getValorantAcs() {
        return valorantAcs;
    }

    public void setValorantAcs(double valorantAcs) {
        this.valorantAcs = valorantAcs;
    }

    public double getValorantRoundWins() {
        return valorantRoundWins;
    }

    public void setValorantRoundWins(double valorantRoundWins) {
        this.valorantRoundWins = valorantRoundWins;
    }

    public double getFortniteKills() {
        return fortniteKills;
    }

    public void setFortniteKills(double fortniteKills) {
        this.fortniteKills = fortniteKills;
    }

    public double getFortniteAvgPlacement() {
        return fortniteAvgPlacement;
    }

    public void setFortniteAvgPlacement(double fortniteAvgPlacement) {
        this.fortniteAvgPlacement = fortniteAvgPlacement;
    }

    public double getFortniteSurvivalMinutes() {
        return fortniteSurvivalMinutes;
    }

    public void setFortniteSurvivalMinutes(double fortniteSurvivalMinutes) {
        this.fortniteSurvivalMinutes = fortniteSurvivalMinutes;
    }

    public double getFortniteObjectives() {
        return fortniteObjectives;
    }

    public void setFortniteObjectives(double fortniteObjectives) {
        this.fortniteObjectives = fortniteObjectives;
    }

    public double getRocketGoals() {
        return rocketGoals;
    }

    public void setRocketGoals(double rocketGoals) {
        this.rocketGoals = rocketGoals;
    }

    public double getRocketAssists() {
        return rocketAssists;
    }

    public void setRocketAssists(double rocketAssists) {
        this.rocketAssists = rocketAssists;
    }

    public double getRocketSaves() {
        return rocketSaves;
    }

    public void setRocketSaves(double rocketSaves) {
        this.rocketSaves = rocketSaves;
    }

    public double getRocketShots() {
        return rocketShots;
    }

    public void setRocketShots(double rocketShots) {
        this.rocketShots = rocketShots;
    }

    public double getRocketMvpRate() {
        return rocketMvpRate;
    }

    public void setRocketMvpRate(double rocketMvpRate) {
        this.rocketMvpRate = rocketMvpRate;
    }

    public double getRocketBoostUsage() {
        return rocketBoostUsage;
    }

    public void setRocketBoostUsage(double rocketBoostUsage) {
        this.rocketBoostUsage = rocketBoostUsage;
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
