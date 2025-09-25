Got it — since your **backend** and **frontend** each have their own `README.md`, the root-level one should stay minimal, just giving context and pointing contributors to the right subdirectories. Here’s a clean draft:

---

# EarthFrame

EarthFrame is a platform for managing and comparing Earth system simulation metadata, with a focus on **E3SM** (Energy Exascale Earth System Model) reference simulations.

This repository contains the full project, organized into backend and frontend applications.

---

## Structure

```
.
├── backend/     # FastAPI, PostgreSQL, SQLAlchemy, Alembic, Pydantic
├── frontend/    # Web app (shadcn, Next.js/React)
└── README.md    # This file
```

---

## Getting Started

Each component has its own setup instructions:

- [Backend README](./backend/README.md)
- [Frontend README](./frontend/README.md)

---

## Development

- Use **Poetry** for Python dependency management (backend).
- Follow **GitHub Issues** for feature tracking.
- Contributions should include tests and documentation updates.

<!-- ADD LICENSE -->
