FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Generate demo data on first run if no DB exists
RUN python -m serp_volatility demo

# Expose port (Cloud Run uses PORT env var)
ENV PORT=8080
EXPOSE 8080

# Launch Streamlit
CMD streamlit run serp_volatility/dashboard/app.py \
    --server.port=${PORT} \
    --server.headless=true \
    --server.address=0.0.0.0 \
    --server.enableCORS=false \
    --server.enableXsrfProtection=false
