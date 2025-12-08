FROM ghcr.io/astral-sh/uv:alpine
WORKDIR /app

# Copy requirements first for better caching
COPY pyproject.toml uv.lock ./
RUN uv sync --no-dev

# Copy application code
COPY . ./

# Run the service
CMD ["uv", "run", "main.py"]

