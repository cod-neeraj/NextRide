# modules/s3-documents/main.tf

resource "aws_s3_bucket" "driver_docs" {
  bucket = "${var.name}-driver-documents"

  tags = {
    Name = "${var.name}-driver-documents"
  }
}

# Block ALL public access — non-negotiable for PII
resource "aws_s3_bucket_public_access_block" "driver_docs" {
  bucket = aws_s3_bucket.driver_docs.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Encrypt everything at rest
resource "aws_s3_bucket_server_side_encryption_configuration" "driver_docs" {
  bucket = aws_s3_bucket.driver_docs.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"   # or "AES256" if you don't want a custom KMS key
    }
    bucket_key_enabled = true
  }
}

# Versioning — protects against overwrite/accidental delete
resource "aws_s3_bucket_versioning" "driver_docs" {
  bucket = aws_s3_bucket.driver_docs.id
  versioning_configuration {
    status = "Enabled"
  }
}

# Bucket policy: deny any non-HTTPS request (defense in depth)
resource "aws_s3_bucket_policy" "driver_docs" {
  bucket = aws_s3_bucket.driver_docs.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "DenyInsecureTransport"
      Effect    = "Deny"
      Principal = "*"
      Action    = "s3:*"
      Resource = [
        aws_s3_bucket.driver_docs.arn,
        "${aws_s3_bucket.driver_docs.arn}/*"
      ]
      Condition = {
        Bool = { "aws:SecureTransport" = "false" }
      }
    }]
  })
}