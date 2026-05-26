package com.fragged.util;

import java.sql.Connection;
import java.sql.SQLException;
import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

public final class DBConnection {

    private static DataSource dataSource;

    private DBConnection() {
    }

    public static Connection getConnection() throws SQLException {
        if (dataSource == null) {
            initDataSource();
        }
        return dataSource.getConnection();
    }

    private static synchronized void initDataSource() throws SQLException {
        if (dataSource != null) {
            return;
        }

        try {
            Context initContext = new InitialContext();
            Context envContext = (Context) initContext.lookup("java:/comp/env");
            dataSource = (DataSource) envContext.lookup("jdbc/fraggeddb");
        } catch (NamingException ex) {
            throw new SQLException("Failed to initialize datasource jdbc/fraggeddb", ex);
        }
    }
}
