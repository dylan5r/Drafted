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

## NBA 2K27 MyPLAYER build lab

A live build creator at `/2k27`: pick a body, drag 21 attribute sliders, and
watch ceilings, overall rating, badges, badge tokens and cap-breaker
projections update as you go.

The engine (`frontend/src/twok27/engine/`) is pure TypeScript with no
dependencies and runs entirely in the browser. It is verified against the
game's own measurements — 256/256 overall-rating vectors, 21/21 attribute
ceilings, and 2,123/2,123 badge-slot totals.

- Rules and provenance: [`docs/nba2k27/RESEARCH.md`](docs/nba2k27/RESEARCH.md)
- Recompile the data tables: `python3 tools/nba2k27/extract_data.py --dataset <clone>`
- Engine tests: `cd frontend && npm run test:engine`

Measurements by [lightmatmul/nba2k27-builder-dataset](https://github.com/lightmatmul/nba2k27-builder-dataset),
cross-checked against [sondberg84/nba2k27-build-lab](https://github.com/sondberg84/nba2k27-build-lab).
Not affiliated with 2K Sports, Visual Concepts or Take-Two Interactive.
