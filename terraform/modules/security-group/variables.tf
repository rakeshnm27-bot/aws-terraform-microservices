variable "project_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "ssh_cidr" {
  description = "Public IP range allowed to SSH"
  type        = string
}
