# Fragged

Premium fantasy esports platform scaffold using:

- Backend: Java 8 + Servlets on Tomcat 9
- Database: MySQL 8
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS

## Backend layout

- `WebContent/WEB-INF/web.xml`
- `WebContent/WEB-INF/context.xml`
- `src/com/fragged/...`
- `database/fragged_schema.sql`

## Frontend layout

- `frontend/package.json`
- `frontend/src/...`

## Next backend deployment steps

1. Place `mysql-connector-java-8.x.jar` in `WebContent/WEB-INF/lib/`.
2. Create the `fragged` schema with `database/fragged_schema.sql`.
3. Update `context.xml` credentials for your local MySQL user.
4. Deploy the project to Tomcat 9 as the `Fragged` webapp.

## Frontend startup

```bash
cd frontend
npm install
npm run dev
```
