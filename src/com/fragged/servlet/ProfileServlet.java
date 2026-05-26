package com.fragged.servlet;

import com.fragged.model.User;
import com.fragged.service.AuthService;
import com.fragged.util.ApiResponseUtil;
import com.fragged.util.JsonUtil;
import java.io.IOException;
import java.sql.SQLException;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class ProfileServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final AuthService authService = new AuthService();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("userId") == null) {
            ApiResponseUtil.writeError(response, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required.");
            return;
        }

        try {
            long userId = ((Long) session.getAttribute("userId")).longValue();
            User user = authService.getProfile(userId);

            if (user == null) {
                ApiResponseUtil.writeError(response, HttpServletResponse.SC_NOT_FOUND, "User not found.");
                return;
            }

            ApiResponseUtil.writeJson(response, HttpServletResponse.SC_OK, "{"
                    + JsonUtil.jsonBoolean("success", true) + ","
                    + "\"user\":{"
                    + JsonUtil.jsonNumber("id", user.getId()) + ","
                    + JsonUtil.jsonPair("email", user.getEmail()) + ","
                    + JsonUtil.jsonPair("username", user.getUsername()) + ","
                    + JsonUtil.jsonPair("avatarUrl", user.getAvatarUrl()) + ","
                    + JsonUtil.jsonPair("favoriteGame", user.getFavoriteGame()) + ","
                    + JsonUtil.jsonPair("bio", user.getBio()) + ","
                    + JsonUtil.jsonNumber("walletBalance", user.getWalletBalance()) + ","
                    + JsonUtil.jsonNumber("xpPoints", user.getXpPoints()) + ","
                    + "\"globalRank\":" + (user.getGlobalRank() == null ? "null" : user.getGlobalRank())
                    + "}"
                    + "}");
        } catch (SQLException ex) {
            ApiResponseUtil.writeError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to load profile.");
        }
    }
}
