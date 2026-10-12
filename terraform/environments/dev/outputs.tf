output "vpc_id" {
  description = "ID of the project VPC"
  value       = module.vpc.vpc_id
}

output "public_subnet_id" {
  description = "ID of the project public subnet"
  value       = module.vpc.public_subnet_id
}

output "security_group_id" {
  description = "ID of the application security group"
  value       = module.security_group.security_group_id
}

output "instance_id" {
  description = "EC2 instance ID"
  value       = module.ec2.instance_id
}

output "public_ip" {
  description = "EC2 public IPv4 address"
  value       = module.ec2.public_ip
}

