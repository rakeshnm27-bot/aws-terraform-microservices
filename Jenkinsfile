pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        EC2_HOST = '13.201.73.178'
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

        stage('Prepare Deployment Images') {
            steps {
                sh '''
                    docker tag devops-learning-service:ci devops-learning-service:local
                    docker tag devops-progress-service:ci devops-progress-service:local
                    docker save \
                      devops-learning-service:local \
                      devops-progress-service:local \
                      -o "$WORKSPACE/deploy-images.tar"
                '''
            }
        }

        stage('Deploy to AWS EC2') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'aws-ec2-ssh',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    sh '''
                        set -eu
                        chmod 600 "$SSH_KEY"

                        ssh -i "$SSH_KEY" \
                          -o StrictHostKeyChecking=accept-new \
                          "$SSH_USER@$EC2_HOST" \
                          'docker info >/dev/null && test -d "$HOME/aws-terraform-microservices"'

                        scp -i "$SSH_KEY" \
                          -o StrictHostKeyChecking=accept-new \
                          "$WORKSPACE/deploy-images.tar" \
                          "$SSH_USER@$EC2_HOST:/tmp/deploy-images.tar"

                        ssh -i "$SSH_KEY" \
                          -o StrictHostKeyChecking=accept-new \
                          "$SSH_USER@$EC2_HOST" \
                          'docker load -i /tmp/deploy-images.tar &&
                           cd "$HOME/aws-terraform-microservices" &&
                           docker compose up -d --no-build learning-service progress-service &&
                           rm -f /tmp/deploy-images.tar &&
                           curl -fsS http://127.0.0.1:5001/health &&
                           curl -fsS http://127.0.0.1:5002/health'
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Tests passed, both services deployed, and health checks passed.'
        }

        failure {
            echo 'FAILURE: Inspect the failed stage in Console Output.'
        }

        always {
            sh 'rm -f "$WORKSPACE/deploy-images.tar"'
        }
    }
}
