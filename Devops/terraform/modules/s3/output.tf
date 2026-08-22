output "bucket_name" {
  value = aws_s3_bucket.driver_docs.id
}
output "bucket_arn" {
  value = aws_s3_bucket.driver_docs.arn
}