
import json
import os

import pymysql
from flask import Flask, jsonify

app = Flask(__name__)


def get_db_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST", "mysql"),
        port=int(os.getenv("DB_PORT", "3306")),
        user=os.environ["DB_USER"],
        password=os.environ["DB_PASSWORD"],
        database=os.getenv("DB_NAME", "learning_portal"),
        cursorclass=pymysql.cursors.DictCursor,
        connect_timeout=5,
    )


@app.get("/")
def home():
    return jsonify({
        "service": "learning-service",
        "message": "DevOps Learning Portal API is running",
    })


@app.get("/health")
def health():
    return jsonify({"status": "UP"}), 200


@app.get("/api/learning-paths")
def learning_paths():
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id, name, topics FROM learning_paths ORDER BY id"
            )
            paths = cursor.fetchall()

        for path in paths:
            topics = path["topics"]
            if isinstance(topics, str):
                path["topics"] = json.loads(topics)

        return jsonify(paths), 200

    except pymysql.MySQLError:
        app.logger.exception("Database query failed")
        return jsonify({"error": "Unable to retrieve learning paths"}), 503

    finally:
        if connection:
            connection.close()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
