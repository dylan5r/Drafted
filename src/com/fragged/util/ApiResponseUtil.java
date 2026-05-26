package com.fragged.util;

import java.io.IOException;
import javax.servlet.http.HttpServletResponse;

public final class ApiResponseUtil {

    private ApiResponseUtil() {
    }

    public static void writeJson(HttpServletResponse response, int statusCode, String payload) throws IOException {
        response.setStatus(statusCode);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(payload);
    }

    public static void writeError(HttpServletResponse response, int statusCode, String message) throws IOException {
        String payload = "{"
                + JsonUtil.jsonBoolean("success", false) + ","
                + JsonUtil.jsonPair("message", message)
                + "}";
        writeJson(response, statusCode, payload);
    }
}
