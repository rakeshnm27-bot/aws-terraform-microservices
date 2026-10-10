
import os

import pymysql
from flask import Flask, jsonify, request

app = Flask(__name__)


def get_db_connection():
    """Create a connection to the MySQL database."""
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
        "service": "progress-service",
        "message": "Progress Service API is running",
    }), 200


@app.get("/health")
def health():
    return jsonify({"status": "UP"}), 200


@app.get("/api/progress")
def get_progress():
    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT user_id, course, completed_lessons,
                       total_lessons, quiz_score, updated_at
                FROM user_progress
                ORDER BY user_id, course
            """)
            records = cursor.fetchall()

        for record in records:
            if record["updated_at"]:
                record["updated_at"] = record["updated_at"].isoformat(
                    sep=" ", timespec="seconds"
                )

        return jsonify(records), 200

    except (pymysql.MySQLError, KeyError, ValueError):
        app.logger.exception("Database operation failed")
        return jsonify({
            "error": "Database temporarily unavailable"
        }), 503

    finally:
        if connection:
            connection.close()


@app.put("/api/progress/<int:user_id>/<string:course>")
def update_progress(user_id, course):
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "A JSON request body is required"
        }), 400

    completed = data.get("completed_lessons")

    if type(completed) is not int or completed < 0:
        return jsonify({
            "error": "completed_lessons must be a non-negative integer"
        }), 400

    connection = None

    try:
        connection = get_db_connection()

        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT total_lessons
                FROM user_progress
                WHERE user_id = %s AND course = %s
                """,
                (user_id, course),
            )
            record = cursor.fetchone()

            if record is None:
                return jsonify({
                    "error": "Progress record not found"
                }), 404

            if completed > record["total_lessons"]:
                return jsonify({
                    "error": "completed_lessons cannot exceed total_lessons"
                }), 400

            cursor.execute(
                """
                UPDATE user_progress
                SET completed_lessons = %s
                WHERE user_id = %s AND course = %s
                """,
                (completed, user_id, course),
            )

        connection.commit()

        return jsonify({
            "message": "Progress updated",
            "user_id": user_id,
            "course": course,
            "completed_lessons": completed,
        }), 200

    except (pymysql.MySQLError, KeyError, ValueError):
        if connection:
            connection.rollback()

        app.logger.exception("Database update failed")
        return jsonify({
            "error": "Database temporarily unavailable"
        }), 503

    finally:
        if connection:
            connection.close()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002)
