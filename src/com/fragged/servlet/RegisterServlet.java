package com.fragged.servlet;

import com.fragged.model.User;
import com.fragged.service.AuthService;
import com.fragged.util.ApiResponseUtil;
import com.fragged.util.JsonUtil;
import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

public class RegisterServlet extends HttpServlet {

    private static final long serialVersionUID = 1L;

    private final AuthService authService = new AuthService();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        try {
            Map<String, String> payload = JsonUtil.readJsonBody(request);
            User user = authService.register(payload);
            establishSession(request, user);
            ApiResponseUtil.writeJson(response, HttpServletResponse.SC_CREATED, buildUserResponse("Registration successful.", user));
        } catch (IllegalArgumentException ex) {
            ApiResponseUtil.writeError(response, HttpServletResponse.SC_BAD_REQUEST, ex.getMessage());
        } catch (SQLException ex) {
            ApiResponseUtil.writeError(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Unable to complete registration.");
        }
    }

    private void establishSession(HttpServletRequest request, User user) {
        HttpSession session = request.getSession(true);
        session.setAttribute("userId", user.getId());
        session.setAttribute("username", user.getUsername());
    }

    private String buildUserResponse(String message, User user) {
        return "{"
                + JsonUtil.jsonBoolean("success", true) + ","
                + JsonUtil.jsonPair("message", message) + ","
                + "\"user\":{"
                + JsonUtil.jsonNumber("id", user.getId()) + ","
                + JsonUtil.jsonPair("email", user.getEmail()) + ","
                + JsonUtil.jsonPair("username", user.getUsername()) + ","
                + JsonUtil.jsonPair("avatarUrl", user.getAvatarUrl()) + ","
                + JsonUtil.jsonPair("favoriteGame", user.getFavoriteGame()) + ","
                + JsonUtil.jsonPair("bio", user.getBio()) + ","
                + JsonUtil.jsonNumber("walletBalance", user.getWalletBalance()) + ","
                + JsonUtil.jsonNumber("xpPoints", user.getXpPoints())
                + "}"
                + "}";
    }
}
