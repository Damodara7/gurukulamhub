# Bucket Policy

{
"Version": "2012-10-17",
"Statement": [
{
"Sid": "PublicReadGetObject",
"Effect": "Allow",
"Principal": "*",
"Action": "s3:GetObject",
"Resource": "arn:aws:s3:::<BUCKET_NAME>/*"
}
]
}

# Cross-origin resource sharing (CORS)

[
{
"AllowedHeaders": [
"*"
],
"AllowedMethods": [
"GET",
"PUT",
"POST",
"DELETE",
"HEAD"
],
"AllowedOrigins": [
"http://localhost:3000",
"https://gurukulamhub.com"
],
"ExposeHeaders": [],
"MaxAgeSeconds": 3000
}
]
