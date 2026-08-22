output "bucket_name" {
  value = aws_s3_bucket.frontend.id
}
output "cloudfront_domain" {
  value = aws_cloudfront_distribution.this.domain_name
}