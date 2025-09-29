# conftest.py
import os
from urllib.parse import urlparse

import psycopg
import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.api.deps import get_db
from app.core.config import settings
from app.main import app

TEST_DB_URL = settings.test_database_url
ALEMBIC_INI_PATH = "alembic.ini"

# Set up the SQLAlchemy engine and sessionmaker for testing
engine = create_engine(TEST_DB_URL, future=True)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Sets up a test database for the application.

    This function performs the following steps:
    1. Sets the `DATABASE_URL` environment variable to the test database URL.
    2. Creates the test database.
    3. Runs database migrations to ensure the schema is up-to-date.

    Yields
    ------
    None
        This function is a generator and is intended to be used as a fixture
        or context manager for setting up and tearing down the test database.
    """

    # Make DATABASE_URL available to the app in case it reads from env.
    os.environ["DATABASE_URL"] = TEST_DB_URL

    _create_test_database()
    _run_migrations()

    yield


def _create_test_database():
    """
    Ensures the existence of a test database for use during testing.

    This function connects to the PostgreSQL server, checks if the test database
    specified in the `TEST_DB_URL` already exists, and creates it if it does not.
    It is intended to be used as part of the pytest setup process.

    Notes
    -----
    - The function assumes that the `TEST_DB_URL` environment variable or constant
      contains the connection string for the test database.
    - The function requires the `psycopg` library for PostgreSQL database interaction.
    - The connection is made to the default "postgres" database to perform the check
      and creation of the test database.

    Raises
    ------
    psycopg.OperationalError
        If there is an issue connecting to the PostgreSQL server.
    psycopg.DatabaseError
        If there is an issue executing the SQL commands.

    See Also
    --------
    _get_db_name_user_and_password_from_url : Extracts database name, user, and password
        from the test database URL.

    Examples
    --------
    >>> _create_test_database()
    [pytest setup] Created database: test_db_name
    """
    db_name, user, password = _get_db_name_user_and_password_from_url(TEST_DB_URL)

    conn = psycopg.connect(
        dbname="postgres",
        user=user,
        password=password,
        host="localhost",
        autocommit=True,
    )
    cur = conn.cursor()

    # Check if test DB already exists
    cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
    if not cur.fetchone():
        cur.execute(f'CREATE DATABASE "{db_name}"')
        print(f"[pytest setup] Created database: {db_name}")
    else:
        print(f"[pytest setup] Using existing test database: {db_name}")

    cur.close()
    conn.close()


def _get_db_name_user_and_password_from_url(
    db_url: str,
) -> tuple[str, str | None, str | None]:
    parsed = urlparse(db_url)

    db_name = parsed.path.lstrip("/")
    user = parsed.username
    password = parsed.password

    return db_name, user, password


def _run_migrations():
    alembic_cfg = Config(ALEMBIC_INI_PATH)

    # Inject test DB URL dynamically into Alembic env.
    alembic_cfg.set_main_option("sqlalchemy.url", TEST_DB_URL)

    command.upgrade(alembic_cfg, "head")


@pytest.fixture
def db() -> Session:
    """
    Provides a new SQLAlchemy session for each test.

    This fixture sets up a fresh database session for every test, ensuring
    isolation and allowing direct access to the test database for assertions.

    Yields
    ------
    Session
        A SQLAlchemy session connected to the test database.

    Notes
    -----
    The session is automatically closed after the test completes.
    """
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.close()


@pytest.fixture
def client(db: Session):
    """Sets up a FastAPI TestClient with a database dependency override.

    This fixture overrides the `get_db` dependency used in FastAPI routes
    to inject a test database session instead of the production database.
    This ensures that the application uses the `earthframe_test` database
    during tests, isolating test data from production data.

    Parameters
    ----------
    db : Session
        A SQLAlchemy session object connected to the test database.

    Yields
    ------
    TestClient
        A FastAPI TestClient instance configured to use the test database.

    Notes
    -----
    - The `get_db` dependency is overridden to yield the provided test
      database session.
    - After the test client is used, the dependency overrides are cleared
      and the test database session is closed.
    """

    def override_get_db():
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
