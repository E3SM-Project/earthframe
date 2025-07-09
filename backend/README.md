# Earthframe Backend

This project uses [Poetry](https://python-poetry.org/) for dependency management and [FastAPI](https://fastapi.tiangolo.com/) as the web framework.

## Setup Instructions

### 1. Install Poetry

If you don't have Poetry installed, run:

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

Or follow the [official instructions](https://python-poetry.org/docs/#installation).

### 2. Install Dependencies

Navigate to the project directory and install dependencies:

```bash
cd /Users/vo13/repositories/earthframe/backend
poetry install
```

### 3. Activate the Poetry Shell (optional)

```bash
poetry shell
```

### 4. Run FastAPI Application

You can start the FastAPI server using [uvicorn](https://www.uvicorn.org/):

```bash
poetry run uvicorn app.main:app --reload
```

- Replace `main:app` with the actual module and app name if different.

The API will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

### 5. API Documentation

Once running, access the interactive docs at:

- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- ReDoc: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

For more details, see the [Poetry documentation](https://python-poetry.org/docs/) and [FastAPI documentation](https://fastapi.tiangolo.com/).
