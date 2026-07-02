# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

# Set the working directory in the container
WORKDIR /app

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy pyproject.toml
COPY pyproject.toml ./

# Install the Python dependencies (install the project in standard mode, not editable)
RUN pip install --upgrade pip \
    && pip install .

# Copy the rest of the application code
COPY app/ ./app/

# Create a volume directory for storage and database
RUN mkdir -p /app/storage /app/data

# Default environment variables for the container
ENV DATABASE_URL="sqlite+aiosqlite:////app/data/origin_hub.db" \
    STORAGE_PATH="/app/storage" \
    SECRET_KEY="change-me-in-production-use-a-long-random-string" \
    MAX_BUNDLE_SIZE_MB=50

# Expose port 8000 for the FastAPI server
EXPOSE 8000

# Run the FastAPI application using Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
