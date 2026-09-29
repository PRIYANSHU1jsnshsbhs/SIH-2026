#!/bin/sh
set -eu

# Render's connectionString is a URI:
#   postgresql://user:password@internal-host/database
# PostgreSQL JDBC does not accept URI user-info in its host section. Remove it
# and provide the credentials through Spring's dedicated properties instead.
database_uri=${RENDER_DATABASE_URL#postgresql://}
database_endpoint=${database_uri#*@}

if [ "$database_endpoint" = "$database_uri" ] || [ -z "$database_endpoint" ]; then
    echo "RENDER_DATABASE_URL is not a valid Render PostgreSQL connection string." >&2
    exit 1
fi

export SPRING_DATASOURCE_URL="jdbc:postgresql://${database_endpoint}"
export SPRING_DATASOURCE_USERNAME="${RENDER_DATABASE_USER}"
export SPRING_DATASOURCE_PASSWORD="${RENDER_DATABASE_PASSWORD}"

# JAVA_OPTS is intentionally expanded so Render can provide multiple JVM flags.
# shellcheck disable=SC2086
exec java ${JAVA_OPTS:-} -Dserver.port="${PORT:-10000}" -jar /app/lapus-backend.jar
