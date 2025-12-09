"""Main entry point for the lessons service."""

import os
import logging
from flask import Flask, jsonify
from scheduler import LessonCacheScheduler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)

# Initialize scheduler
scheduler = None


@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    try:
        status = scheduler.get_status() if scheduler else {"running": False}
        cache_healthy = status.get("cache_healthy", False)
        if cache_healthy:
            return jsonify({"status": "healthy", **status}), 200
        else:
            return jsonify({"status": "unhealthy", **status}), 503
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return jsonify({"status": "error", "error": str(e)}), 500


def main():
    """Main function to start the service."""
    global scheduler

    # Validate required environment variables
    github_token = os.getenv("GITHUB_TOKEN")
    if not github_token:
        logger.error("GITHUB_TOKEN environment variable is required")
        raise ValueError("GITHUB_TOKEN environment variable is required")

    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
    logger.info(f"Connecting to Redis at {redis_url}")

    # Initialize and start scheduler
    try:
        scheduler = LessonCacheScheduler()
        scheduler.start()
        logger.info("Lessons service started successfully")
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}", exc_info=True)
        raise

    # Start Flask server for health checks
    port = int(os.getenv("PORT", "8080"))
    logger.info(f"Starting Flask server on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)


if __name__ == "__main__":
    main()
