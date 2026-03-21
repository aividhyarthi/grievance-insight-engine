FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project source
COPY . .

# Pre-generate demo data into the image so first startup is instant
RUN python -m serp_volatility demo

# Railway injects $PORT at runtime; default to 8080 for local Docker runs
ENV PORT=8080

# Use exec form + sh -c so $PORT expands correctly at runtime
CMD ["sh", "-c", "streamlit run serp_volatility/dashboard/app.py --server.port=$PORT --server.headless=true --server.address=0.0.0.0 --server.enableCORS=false --server.enableXsrfProtection=false"]
