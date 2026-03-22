"""
Centralized structured logging configuration for Python services
Uses structlog for consistent, parseable logs
"""

import logging
import structlog
from structlog.processors import JSONRenderer
import sys
import os

def configure_logging(
    service_name: str = None,
    level: str = None,
    json_logs: bool = None
):
    """
    Configure structured logging for the application
    
    Args:
        service_name: Name of the service (defaults to SERVICE_NAME env var)
        level: Log level (defaults to LOG_LEVEL env var or INFO)
        json_logs: Whether to use JSON formatting (defaults to true in production)
    """
    service_name = service_name or os.getenv("SERVICE_NAME", "blackroad")
    level = level or os.getenv("LOG_LEVEL", "INFO")
    json_logs = json_logs if json_logs is not None else (os.getenv("NODE_ENV") == "production")
    
    # Configure standard library logging
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=getattr(logging, level.upper()),
    )
    
    # Configure structlog
    processors = [
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
    ]
    
    if json_logs:
        processors.append(JSONRenderer())
    else:
        processors.append(structlog.dev.ConsoleRenderer())
    
    structlog.configure(
        processors=processors,
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        cache_logger_on_first_use=True,
    )
    
    # Add default context
    logger = structlog.get_logger()
    logger = logger.bind(
        service=service_name,
        environment=os.getenv("NODE_ENV", "development"),
        version=os.getenv("APP_VERSION", "1.0.0"),
    )
    
    return logger


def get_logger(name: str = None):
    """Get a logger instance with optional name binding"""
    logger = structlog.get_logger()
    if name:
        logger = logger.bind(module=name)
    return logger


# Example usage:
if __name__ == "__main__":
    logger = configure_logging(service_name="example-service")
    logger.info("Application started", extra_field="value")
    logger.error("Something went wrong", error_code=500)
