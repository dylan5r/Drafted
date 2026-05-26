package com.fragged.model;

import java.io.Serializable;
import java.sql.Timestamp;

public class TeamPlayer implements Serializable {

    private long id;
    private long fantasyTeamId;
    private long playerId;
    private String slotName;
    private boolean captain;
    private boolean locked;
    private Timestamp addedAt;

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

    public long getPlayerId() {
        return playerId;
    }

    public void setPlayerId(long playerId) {
        this.playerId = playerId;
    }

    public String getSlotName() {
        return slotName;
    }

    public void setSlotName(String slotName) {
        this.slotName = slotName;
    }

    public boolean isCaptain() {
        return captain;
    }

    public void setCaptain(boolean captain) {
        this.captain = captain;
    }

    public boolean isLocked() {
        return locked;
    }

    public void setLocked(boolean locked) {
        this.locked = locked;
    }

    public Timestamp getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(Timestamp addedAt) {
        this.addedAt = addedAt;
    }
}
