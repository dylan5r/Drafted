package com.fragged.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.servlet.http.HttpServletRequest;

public final class JsonUtil {

    private static final Pattern FLAT_JSON_PATTERN =
            Pattern.compile("\"([^\"]+)\"\\s*:\\s*(\"((?:\\\\.|[^\"])*)\"|-?\\d+(?:\\.\\d+)?|true|false|null)");

    private JsonUtil() {
    }

    public static Map<String, String> parseObject(String json) {
        if (json == null || json.trim().isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, String> values = new LinkedHashMap<String, String>();
        Matcher matcher = FLAT_JSON_PATTERN.matcher(json);
        while (matcher.find()) {
            String key = matcher.group(1);
            String rawValue = matcher.group(2);
            if (rawValue == null || "null".equals(rawValue)) {
                values.put(key, null);
            } else if (rawValue.startsWith("\"")) {
                values.put(key, unescapeJson(matcher.group(3)));
            } else {
                values.put(key, rawValue);
            }
        }
        return values;
    }

    public static Map<String, String> readJsonBody(HttpServletRequest request) throws IOException {
        StringBuilder builder = new StringBuilder();
        BufferedReader reader = request.getReader();
        String line;
        while ((line = reader.readLine()) != null) {
            builder.append(line);
        }
        return parseObject(builder.toString());
    }

    public static String jsonPair(String key, String value) {
        return "\"" + escapeJson(key) + "\":\"" + escapeJson(value == null ? "" : value) + "\"";
    }

    public static String jsonNumber(String key, Number value) {
        return "\"" + escapeJson(key) + "\":" + value;
    }

    public static String jsonBoolean(String key, boolean value) {
        return "\"" + escapeJson(key) + "\":" + value;
    }

    public static String escapeJson(String value) {
        if (value == null) {
            return "";
        }

        return value
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    private static String unescapeJson(String value) {
        if (value == null) {
            return null;
        }

        return value
                .replace("\\\"", "\"")
                .replace("\\\\", "\\")
                .replace("\\n", "\n")
                .replace("\\r", "\r")
                .replace("\\t", "\t")
                .replace("\\b", "\b")
                .replace("\\f", "\f");
    }
}
