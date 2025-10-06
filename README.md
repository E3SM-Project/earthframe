# EarthFrame

EarthFrame is a platform for managing and comparing Earth system simulation metadata, with a focus on **E3SM** (Energy Exascale Earth System Model) reference simulations.

The goal of EarthFrame is to provide researchers with tools to:

- Store and organize simulation metadata
- Browse and visualize simulation details
- Compare runs side-by-side
- Surface diagnostics and key information for analysis

---

## 🚀 Developer Quickstart

Get started in **five simple commands**:

```bash
# 1. Clone the repository
git clone https://github.com/<your-org>/earthframe.git
cd earthframe

# 2. Install dependencies for backend and frontend
make install

# 3. Start both services (backend + frontend)
make start

# 4. Open the API and UI
open http://127.0.0.1:8000/docs       # Backend Swagger UI
open http://127.0.0.1:5173            # Frontend web app

# 5. Run linters and type checks (optional)
make lint
make type-check
```

---

## Table of Contents

- [Repository Structure](#repository-structure)
- [Development](#development)
- [🧰 Project Makefile Commands](#-project-makefile-commands)

  - [Setup & Environment](#setup--environment)
  - [Development](#development-1)
  - [Database & Migrations](#database--migrations)
  - [Code Quality](#code-quality)
  - [Build & Preview](#build--preview)
  - [Example Workflow](#example-workflow)

- [License](#license)

---

## Repository Structure

```bash
.
├── backend/     # FastAPI, PostgreSQL, SQLAlchemy, Alembic, Pydantic
├── frontend/    # Web app (Vite/React + Tailwind + shadcn)
└── README.md    # This file
```

Each component has its own README with setup instructions:

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

---

## Development

- Backend dependencies are managed with **Poetry**.
- Frontend dependencies are managed with **pnpm**.
- Use **[GitHub Issues](https://github.com/E3SM-Project/earthframe/issues)** for feature requests and tracking.
- Contributions should include tests and documentation updates.

---

## 🧰 Project Makefile Commands

This repository includes a **top-level Makefile** that orchestrates both the backend and frontend.

Run `make help` to view all available commands.

### Setup & Environment

| Command        | Description                                    | Equivalent Command                                               |
| -------------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| `make install` | Install dependencies for backend and frontend. | `cd backend && poetry install && cd ../frontend && pnpm install` |
| `make clean`   | Remove build artifacts and node_modules.       | `cd backend && make clean && cd ../frontend && make clean`       |

---

### Development

| Command         | Description                               | Equivalent Command                                       |
| --------------- | ----------------------------------------- | -------------------------------------------------------- |
| `make start`    | Start backend and frontend concurrently.  | `make reload` (backend) + `make dev` (frontend)          |
| `make backend`  | Run backend (FastAPI) development server. | `cd backend && poetry run uvicorn app.main:app --reload` |
| `make frontend` | Run frontend (Vite) development server.   | `cd frontend && pnpm dev`                                |

---

### Database & Migrations

| Command                | Description                       | Equivalent Command                                                  |
| ---------------------- | --------------------------------- | ------------------------------------------------------------------- |
| `make migrate m="msg"` | Generate a new Alembic migration. | `cd backend && poetry run alembic revision --autogenerate -m "msg"` |
| `make upgrade`         | Apply all pending migrations.     | `cd backend && poetry run alembic upgrade head`                     |

---

### Code Quality

| Command           | Description                                 | Equivalent Command                                                               |
| ----------------- | ------------------------------------------- | -------------------------------------------------------------------------------- |
| `make lint`       | Run linters for both backend and frontend.  | `cd backend && poetry run ruff check . && cd ../frontend && pnpm lint`           |
| `make format`     | Auto-fix code style issues.                 | `cd backend && poetry run ruff check . --fix && cd ../frontend && pnpm lint:fix` |
| `make type-check` | Run TypeScript type checks (frontend only). | `cd frontend && pnpm type-check`                                                 |

---

### Build & Preview

| Command        | Description                                | Equivalent Command            |
| -------------- | ------------------------------------------ | ----------------------------- |
| `make build`   | Build frontend for production.             | `cd frontend && pnpm build`   |
| `make preview` | Preview frontend production build locally. | `cd frontend && pnpm preview` |

---

### Example Workflow

```bash
# 1. Install everything
make install

# 2. Run both backend and frontend
make start

# 3. Generate and apply a new database migration
make migrate m="Add user table"
make upgrade

# 4. Lint and fix code
make lint
make format
```

---

## License

TBD
