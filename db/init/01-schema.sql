
CREATE DATABASE IF NOT EXISTS learning_portal;
USE learning_portal;

CREATE TABLE IF NOT EXISTS learning_paths (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    topics JSON NOT NULL
);

CREATE TABLE IF NOT EXISTS user_progress (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course VARCHAR(100) NOT NULL,
    completed_lessons INT NOT NULL DEFAULT 0,
    total_lessons INT NOT NULL,
    quiz_score DECIMAL(5,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_course (user_id, course)
);

INSERT IGNORE INTO learning_paths (name, topics) VALUES
('AWS', '["IAM", "VPC", "EC2", "S3"]'),
('Terraform', '["Providers", "Resources", "State", "Modules"]'),
('Docker', '["Images", "Containers", "Volumes", "Networking"]'),
('Jenkins', '["Pipelines", "Jenkinsfile", "Builds", "Deployments"]');

INSERT IGNORE INTO user_progress
    (user_id, course, completed_lessons, total_lessons, quiz_score)
VALUES
    (1, 'AWS', 3, 10, 80),
    (1, 'Terraform', 5, 8, 90);
