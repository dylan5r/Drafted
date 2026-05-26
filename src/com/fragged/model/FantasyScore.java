package com.fragged.model;

import java.io.Serializable;
import java.sql.Date;
import java.sql.Timestamp;

public class FantasyScore implements Serializable {

    private long id;
    private long fantasyTeamId;
    private long matchId;
    private Date scoreDate;
    private double projectedPoints;
    private double livePoints;
    private double finalPoints;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public long getFantasyTeamId() {
        return fantasyTeamId;
    }

    public void setFantasyTeamId(long fantasyTeamId) {
        this.fantasyTeamId = fantasyTeamId;
    }

    public long getMatchId() {
        return matchId;
    }

    public void setMatchId(long matchId) {
        this.matchId = matchId;
    }

    public Date getScoreDate() {
        return scoreDate;
    }

    public void setScoreDate(Date scoreDate) {
        this.scoreDate = scoreDate;
    }

    public double getProjectedPoints() {
        return projectedPoints;
    }

    public void setProjectedPoints(double projectedPoints) {
        this.projectedPoints = projectedPoints;
    }

    public double getLivePoints() {
        return livePoints;
    }

    public void setLivePoints(double livePoints) {
        this.livePoints = livePoints;
    }

    public double getFinalPoints() {
        return finalPoints;
    }

    public void setFinalPoints(double finalPoints) {
        this.finalPoints = finalPoints;
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
