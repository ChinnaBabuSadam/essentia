/*
 * Copyright 2018 Cloud Elements
 *
 * Terraform main configuration file (with provider definitions).
 */

variable "aws_region" {
  description = "AWS region"
  type        = "string"
  default     = "us-west-2"
}

variable "cluster_name" {
  description = "Cluster name"
  type        = "string"
}

variable "environment" {
  description = "Environment name"
  type        = "string"
}

provider "aws" {
  region = "${var.aws_region}"
}