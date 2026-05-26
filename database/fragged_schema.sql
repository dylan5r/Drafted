CREATE DATABASE IF NOT EXISTS fragged
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE fragged;

CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    avatar_url VARCHAR(512),
    favorite_game ENUM('VALORANT', 'FORTNITE', 'ROCKET_LEAGUE') DEFAULT 'VALORANT',
    bio VARCHAR(500),
    wallet_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    xp_points INT NOT NULL DEFAULT 0,
    global_rank INT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE friendships (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    requester_user_id BIGINT NOT NULL,
    addressee_user_id BIGINT NOT NULL,
    status ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_friendship_pair (requester_user_id, addressee_user_id),
    CONSTRAINT fk_friendship_requester FOREIGN KEY (requester_user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_friendship_addressee FOREIGN KEY (addressee_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE rewards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(60) NOT NULL UNIQUE,
    title VARCHAR(120) NOT NULL,
    description VARCHAR(255) NOT NULL,
    reward_type ENUM('BADGE', 'TITLE', 'CURRENCY', 'SEASONAL') NOT NULL,
    icon_url VARCHAR(512),
    rarity ENUM('COMMON', 'RARE', 'EPIC', 'LEGENDARY') NOT NULL DEFAULT 'COMMON',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_rewards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    reward_id BIGINT NOT NULL,
    awarded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_reward (user_id, reward_id),
    CONSTRAINT fk_user_rewards_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_rewards_reward FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE
);

CREATE TABLE players (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    game ENUM('VALORANT', 'FORTNITE', 'ROCKET_LEAGUE') NOT NULL,
    external_player_id VARCHAR(80),
    handle VARCHAR(80) NOT NULL,
    real_name VARCHAR(120),
    team_name VARCHAR(120),
    region VARCHAR(60),
    role_name VARCHAR(60),
    agent_or_specialty VARCHAR(120),
    rarity ENUM('COMMON', 'RARE', 'EPIC', 'LEGENDARY') NOT NULL DEFAULT 'COMMON',
    salary INT NOT NULL,
    recent_form DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    projected_points DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    avatar_url VARCHAR(512),
    status ENUM('ACTIVE', 'INACTIVE', 'QUESTIONABLE') NOT NULL DEFAULT 'ACTIVE',
    valorant_kills DECIMAL(6,2) DEFAULT 0.00,
    valorant_deaths DECIMAL(6,2) DEFAULT 0.00,
    valorant_assists DECIMAL(6,2) DEFAULT 0.00,
    valorant_acs DECIMAL(6,2) DEFAULT 0.00,
    valorant_round_wins DECIMAL(6,2) DEFAULT 0.00,
    fortnite_kills DECIMAL(6,2) DEFAULT 0.00,
    fortnite_avg_placement DECIMAL(6,2) DEFAULT 0.00,
    fortnite_survival_minutes DECIMAL(6,2) DEFAULT 0.00,
    fortnite_objectives DECIMAL(6,2) DEFAULT 0.00,
    rocket_goals DECIMAL(6,2) DEFAULT 0.00,
    rocket_assists DECIMAL(6,2) DEFAULT 0.00,
    rocket_saves DECIMAL(6,2) DEFAULT 0.00,
    rocket_shots DECIMAL(6,2) DEFAULT 0.00,
    rocket_mvp_rate DECIMAL(6,2) DEFAULT 0.00,
    rocket_boost_usage DECIMAL(6,2) DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE matches (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    game ENUM('VALORANT', 'FORTNITE', 'ROCKET_LEAGUE') NOT NULL,
    event_name VARCHAR(150) NOT NULL,
    stage_name VARCHAR(120),
    team_a_name VARCHAR(120),
    team_b_name VARCHAR(120),
    starts_at DATETIME NOT NULL,
    status ENUM('SCHEDULED', 'LIVE', 'FINAL') NOT NULL DEFAULT 'SCHEDULED',
    stream_url VARCHAR(512),
    metadata_json TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE player_match_stats (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    match_id BIGINT NOT NULL,
    player_id BIGINT NOT NULL,
    team_name VARCHAR(120),
    kills DECIMAL(8,2) DEFAULT 0.00,
    deaths DECIMAL(8,2) DEFAULT 0.00,
    assists DECIMAL(8,2) DEFAULT 0.00,
    acs DECIMAL(8,2) DEFAULT 0.00,
    round_wins DECIMAL(8,2) DEFAULT 0.00,
    placement_position INT DEFAULT NULL,
    survival_minutes DECIMAL(8,2) DEFAULT 0.00,
    objectives DECIMAL(8,2) DEFAULT 0.00,
    goals DECIMAL(8,2) DEFAULT 0.00,
    saves DECIMAL(8,2) DEFAULT 0.00,
    shots DECIMAL(8,2) DEFAULT 0.00,
    mvp_awarded TINYINT(1) NOT NULL DEFAULT 0,
    boost_usage DECIMAL(8,2) DEFAULT 0.00,
    fantasy_points DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_player_match (match_id, player_id),
    CONSTRAINT fk_player_match_stats_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    CONSTRAINT fk_player_match_stats_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE fantasy_teams (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    game ENUM('VALORANT', 'FORTNITE', 'ROCKET_LEAGUE') NOT NULL,
    name VARCHAR(120) NOT NULL,
    strategy_notes VARCHAR(500),
    salary_cap INT NOT NULL DEFAULT 50000,
    salary_used INT NOT NULL DEFAULT 0,
    projected_points DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    live_points DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    power_rating DECIMAL(6,2) NOT NULL DEFAULT 0.00,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_fantasy_teams_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE team_players (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    fantasy_team_id BIGINT NOT NULL,
    player_id BIGINT NOT NULL,
    slot_name VARCHAR(60) NOT NULL,
    captain TINYINT(1) NOT NULL DEFAULT 0,
    locked TINYINT(1) NOT NULL DEFAULT 0,
    added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_team_slot (fantasy_team_id, slot_name),
    UNIQUE KEY uq_team_player (fantasy_team_id, player_id),
    CONSTRAINT fk_team_players_team FOREIGN KEY (fantasy_team_id) REFERENCES fantasy_teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_team_players_player FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE RESTRICT
);

CREATE TABLE leagues (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    owner_user_id BIGINT DEFAULT NULL,
    name VARCHAR(120) NOT NULL,
    description VARCHAR(500),
    game ENUM('VALORANT', 'FORTNITE', 'ROCKET_LEAGUE') NOT NULL,
    visibility ENUM('PUBLIC', 'PRIVATE') NOT NULL DEFAULT 'PUBLIC',
    league_type ENUM('DAILY', 'WEEKLY', 'SEASONAL', 'HEAD_TO_HEAD') NOT NULL DEFAULT 'DAILY',
    invite_code VARCHAR(20) UNIQUE,
    entry_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    salary_cap INT NOT NULL DEFAULT 50000,
    custom_rules_json TEXT,
    starts_at DATETIME,
    ends_at DATETIME,
    status ENUM('UPCOMING', 'LIVE', 'COMPLETED') NOT NULL DEFAULT 'UPCOMING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_leagues_owner FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE league_members (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    league_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    fantasy_team_id BIGINT DEFAULT NULL,
    standing_rank INT DEFAULT NULL,
    total_points DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_league_member (league_id, user_id),
    CONSTRAINT fk_league_members_league FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
    CONSTRAINT fk_league_members_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_league_members_team FOREIGN KEY (fantasy_team_id) REFERENCES fantasy_teams(id) ON DELETE SET NULL
);

CREATE TABLE head_to_head_matchups (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    league_id BIGINT NOT NULL,
    home_member_id BIGINT NOT NULL,
    away_member_id BIGINT NOT NULL,
    home_points DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    away_points DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    matchup_status ENUM('SCHEDULED', 'LIVE', 'FINAL') NOT NULL DEFAULT 'SCHEDULED',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_matchups_league FOREIGN KEY (league_id) REFERENCES leagues(id) ON DELETE CASCADE,
    CONSTRAINT fk_matchups_home FOREIGN KEY (home_member_id) REFERENCES league_members(id) ON DELETE CASCADE,
    CONSTRAINT fk_matchups_away FOREIGN KEY (away_member_id) REFERENCES league_members(id) ON DELETE CASCADE
);

CREATE TABLE fantasy_scores (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    fantasy_team_id BIGINT NOT NULL,
    match_id BIGINT NOT NULL,
    score_date DATE NOT NULL,
    projected_points DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    live_points DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    final_points DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_fantasy_score (fantasy_team_id, match_id, score_date),
    CONSTRAINT fk_fantasy_scores_team FOREIGN KEY (fantasy_team_id) REFERENCES fantasy_teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_fantasy_scores_match FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE
);

CREATE TABLE team_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    fantasy_team_id BIGINT NOT NULL,
    metric_name VARCHAR(80) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    recorded_at DATETIME NOT NULL,
    CONSTRAINT fk_team_history_team FOREIGN KEY (fantasy_team_id) REFERENCES fantasy_teams(id) ON DELETE CASCADE
);

CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(120) NOT NULL,
    message VARCHAR(500) NOT NULL,
    type ENUM('INFO', 'SUCCESS', 'WARNING', 'LIVE_SCORE', 'REWARD') NOT NULL DEFAULT 'INFO',
    read_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE news_posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    game ENUM('VALORANT', 'FORTNITE', 'ROCKET_LEAGUE', 'PLATFORM') NOT NULL DEFAULT 'PLATFORM',
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    summary VARCHAR(400) NOT NULL,
    body TEXT NOT NULL,
    post_type ENUM('NEWS', 'PATCH_NOTES', 'FEATURED') NOT NULL DEFAULT 'NEWS',
    cover_image_url VARCHAR(512),
    published_at DATETIME NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO rewards (code, title, description, reward_type, rarity)
VALUES
('FIRST_BLOOD', 'First Blood', 'Won your first public contest.', 'BADGE', 'COMMON'),
('TOP_FRAGGER', 'Top Fragger', 'Reached the top 1% in a Valorant contest.', 'TITLE', 'EPIC'),
('BOOST_MASTER', 'Boost Master', 'Dominated a Rocket League weekly ladder.', 'BADGE', 'RARE');

INSERT INTO players (
    game, external_player_id, handle, real_name, team_name, region, role_name, agent_or_specialty,
    rarity, salary, recent_form, projected_points, avatar_url, status,
    valorant_kills, valorant_deaths, valorant_assists, valorant_acs, valorant_round_wins,
    fortnite_kills, fortnite_avg_placement, fortnite_survival_minutes, fortnite_objectives,
    rocket_goals, rocket_assists, rocket_saves, rocket_shots, rocket_mvp_rate, rocket_boost_usage
) VALUES
('VALORANT', 'vlr-tenz', 'TenZ', 'Tyson Ngo', 'Sentinels', 'NA', 'Duelist', 'Jett', 'LEGENDARY', 12500, 95.40, 245.80, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', 'ACTIVE', 24.5, 13.1, 7.8, 281.4, 12.6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
('VALORANT', 'vlr-derke', 'Derke', 'Nikita Sirmitev', 'Fnatic', 'EMEA', 'Duelist', 'Raze', 'EPIC', 11200, 91.20, 221.40, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d', 'ACTIVE', 22.1, 13.9, 6.4, 263.9, 11.8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
('VALORANT', 'vlr-chronicle', 'Chronicle', 'Timofey Khromov', 'Fnatic', 'EMEA', 'Flex', 'Viper', 'RARE', 9600, 87.50, 188.60, 'https://images.unsplash.com/photo-1504593811423-6dd665756598', 'ACTIVE', 18.5, 12.6, 8.5, 231.6, 10.9, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0),
('FORTNITE', 'fn-bugha', 'Bugha', 'Kyle Giersdorf', 'Dignitas', 'NA', 'Fragger', 'End Game IGL', 'LEGENDARY', 11800, 94.70, 238.20, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', 'ACTIVE', 0, 0, 0, 0, 0, 5.2, 3.6, 21.5, 2.3, 0, 0, 0, 0, 0, 0),
('FORTNITE', 'fn-mero', 'Mero', 'Matthew Faitel', 'Dignitas', 'NA', 'Slayer', 'Objective Control', 'EPIC', 10900, 90.30, 214.80, 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d', 'ACTIVE', 0, 0, 0, 0, 0, 4.8, 4.1, 20.7, 2.8, 0, 0, 0, 0, 0, 0),
('ROCKET_LEAGUE', 'rl-monkeymoon', 'Monkey Moon', 'Evan Rogez', 'Team BDS', 'EU', 'Striker', 'Boost Efficiency', 'LEGENDARY', 12100, 93.10, 229.50, 'https://images.unsplash.com/photo-1504593811423-6dd665756598', 'ACTIVE', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1.4, 0.7, 2.1, 4.5, 0.42, 76.3),
('ROCKET_LEAGUE', 'rl-zen', 'zen', 'Alexis Bernier', 'Vitality', 'EU', 'Playmaker', 'Aerial Control', 'EPIC', 11400, 92.00, 217.40, 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e', 'ACTIVE', 0, 0, 0, 0, 0, 0, 0, 0, 0, 1.2, 0.9, 1.7, 4.2, 0.39, 79.8);

INSERT INTO matches (game, event_name, stage_name, team_a_name, team_b_name, starts_at, status, stream_url, metadata_json)
VALUES
('VALORANT', 'VCT Masters Madrid', 'Group Stage', 'Sentinels', 'Fnatic', DATE_ADD(NOW(), INTERVAL 1 DAY), 'SCHEDULED', 'https://twitch.tv/valorant', '{"mapPool":["Bind","Split","Sunset"]}'),
('FORTNITE', 'FNCS Grand Finals', 'Session 1', 'Bugha & Mero', 'Field', DATE_ADD(NOW(), INTERVAL 2 DAY), 'SCHEDULED', 'https://twitch.tv/fortnite', '{"matchCount":6}'),
('ROCKET_LEAGUE', 'RLCS Major', 'Swiss Round 1', 'Team BDS', 'Vitality', DATE_ADD(NOW(), INTERVAL 3 DAY), 'SCHEDULED', 'https://twitch.tv/rocketleague', '{"bestOf":5}');

INSERT INTO news_posts (game, title, slug, summary, body, post_type, cover_image_url, published_at)
VALUES
('PLATFORM', 'Fragged Closed Alpha Begins', 'fragged-closed-alpha-begins', 'The first competitive fantasy esports alpha is now live.', 'Fragged launches with premium contests, mock live scoring, and full cross-title roster building.', 'FEATURED', 'https://images.unsplash.com/photo-1511512578047-dfb367046420', NOW()),
('VALORANT', 'Patch Watch: Duelist Meta Rising', 'patch-watch-duelist-meta-rising', 'A faster meta is pushing elite entry fraggers to the top of projections.', 'Expect salary inflation for premier duelists heading into the next VCT slate.', 'PATCH_NOTES', 'https://images.unsplash.com/photo-1542751371-adc38448a05e', NOW());
