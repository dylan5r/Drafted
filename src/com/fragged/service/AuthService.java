package com.fragged.service;

import com.fragged.dao.UserDao;
import com.fragged.model.User;
import com.fragged.util.PasswordUtil;
import java.sql.SQLException;
import java.util.Map;

public class AuthService {

    private final UserDao userDao;

    public AuthService() {
        this.userDao = new UserDao();
    }

    public User register(Map<String, String> payload) throws SQLException {
        String email = safeTrim(payload.get("email"));
        String password = safeTrim(payload.get("password"));
        String username = safeTrim(payload.get("username"));
        String favoriteGame = defaultValue(safeTrim(payload.get("favoriteGame")), "VALORANT");
        String bio = defaultValue(safeTrim(payload.get("bio")), "Competitive rookie loading in.");
        String avatarUrl = defaultValue(safeTrim(payload.get("avatarUrl")), buildDefaultAvatar(username));

        validateRegistration(email, password, username, bio);

        if (userDao.emailExists(email)) {
            throw new IllegalArgumentException("Email is already registered.");
        }
        if (userDao.usernameExists(username)) {
            throw new IllegalArgumentException("Username is already taken.");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(PasswordUtil.hashPassword(password));
        user.setUsername(username);
        user.setFavoriteGame(favoriteGame);
        user.setBio(bio);
        user.setAvatarUrl(avatarUrl);
        user.setWalletBalance(12500.00);
        user.setXpPoints(250);
        return userDao.create(user);
    }

    public User login(Map<String, String> payload) throws SQLException {
        String email = safeTrim(payload.get("email"));
        String password = safeTrim(payload.get("password"));

        if (email == null || password == null) {
            throw new IllegalArgumentException("Email and password are required.");
        }

        User user = userDao.findByEmail(email);
        if (user == null || !PasswordUtil.verifyPassword(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        return user;
    }

    public User getProfile(long userId) throws SQLException {
        return userDao.findById(userId);
    }

    private void validateRegistration(String email, String password, String username, String bio) {
        if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")) {
            throw new IllegalArgumentException("A valid email is required.");
        }
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters.");
        }
        if (username == null || username.length() < 3 || username.length() > 24) {
            throw new IllegalArgumentException("Username must be between 3 and 24 characters.");
        }
        if (bio != null && bio.length() > 500) {
            throw new IllegalArgumentException("Bio must be 500 characters or fewer.");
        }
    }

    private String safeTrim(String value) {
        return value == null ? null : value.trim();
    }

    private String defaultValue(String value, String fallback) {
        return value == null || value.isEmpty() ? fallback : value;
    }

    private String buildDefaultAvatar(String username) {
        String seed = username == null || username.isEmpty() ? "fragged" : username;
        return "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=" + seed;
    }
}
