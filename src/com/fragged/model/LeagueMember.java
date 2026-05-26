package com.fragged.model;

import java.io.Serializable;
import java.sql.Timestamp;

public class LeagueMember implements Serializable {

    private long id;
    private long leagueId;
    private long userId;
    private Long fantasyTeamId;
    private Integer standingRank;
    private double totalPoints;
    private Timestamp joinedAt;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public long getLeagueId() {
        return leagueId;
    }

    public void setLeagueId(long leagueId) {
        this.leagueId = leagueId;
    }

    public long getUserId() {
        return userId;
    }

    public void setUserId(long userId) {
        this.userId = userId;
    }

    public Long getFantasyTeamId() {
        return fantasyTeamId;
    }

    public void setFantasyTeamId(Long fantasyTeamId) {
        this.fantasyTeamId = fantasyTeamId;
    }

    public Integer getStandingRank() {
        return standingRank;
    }

    public void setStandingRank(Integer standingRank) {
        this.standingRank = standingRank;
    }

    public double getTotalPoints() {
        return totalPoints;
    }

    public void setTotalPoints(double totalPoints) {
        this.totalPoints = totalPoints;
    }

    public Timestamp getJoinedAt() {
        return joinedAt;
    }

    public void setJoinedAt(Timestamp joinedAt) {
        this.joinedAt = joinedAt;
    }
}
