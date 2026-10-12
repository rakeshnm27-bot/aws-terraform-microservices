resource "aws_security_group" "app" {
  name        = "${var.project_name}-app-sg"
  description = "Security group for the microservices lab"
  vpc_id      = var.vpc_id

  ingress {
    description = "SSH from approved public IP only"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name      = "${var.project_name}-app-sg"
    Project   = var.project_name
    ManagedBy = "Terraform"
  }
}
