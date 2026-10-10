pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Build Learning Service') {
            steps {
                sh 'docker build -t devops-learning-service:ci ./learning-service'
            }
        }

        stage('Test Learning Service') {
            steps {
                sh '''
                    docker run --rm \
                      --entrypoint python \
                      -v "$WORKSPACE/learning-service/tests:/tests:ro" \
                      devops-learning-service:ci \
                      -m pytest -q -p no:cacheprovider /tests
                '''
            }
        }

        stage('Build Progress Service') {
            steps {
                sh 'docker build -t devops-progress-service:ci ./progress-service'
            }
        }

        stage('Test Progress Service') {
            steps {
                sh '''
                    docker run --rm \
                      --entrypoint python \
                      -v "$WORKSPACE/progress-service/tests:/tests:ro" \
                      devops-progress-service:ci \
                      -m pytest -q -p no:cacheprovider /tests
                '''
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Both microservices built and all tests passed.'
        }

        failure {
            echo 'FAILURE: Check the stage logs to identify the issue.'
        }
    }
}
