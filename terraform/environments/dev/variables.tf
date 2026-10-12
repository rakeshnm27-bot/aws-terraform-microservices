variable "aws_region" {
  description = "AWS region for the learning project"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project resource name prefix"
  type        = string
  default     = "aws-terraform-microservices"
}

variable "vpc_cidr" {
  description = "CIDR range for the dedicated project VPC"
  type        = string
  default     = "10.20.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR range for the project subnet"
  type        = string
  default     = "10.20.1.0/24"
}

variable "availability_zone" {
  description = "Availability zone for the project subnet"
  type        = string
  default     = "ap-south-1b"
}

variable "ssh_cidr" {
  description = "Your public IP allowed to SSH into EC2"
  type        = string
}


variable "key_name" {
  description = "Existing EC2 key pair name"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type for the lab"
  type        = string
  default     = "t3.micro"
}

