@echo off
echo We need the direct database URL for migrations...
echo Please go to your Vercel database dashboard and get the "Non-pooled connection" URL
echo Then run this command:
echo.
echo set DIRECT_DATABASE_URL=your_direct_url_here
echo set DATABASE_URL=@prisma+postgres://accelerate.prisma-data.net/?api_key=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlfa2V5IjoiMDFKWDIzME1DNUU5MjI2QkcxTThCMEZRWkIiLCJ0ZW5hbnRfaWQiOiIzZTI2MDFlZDMzM2IwNDkyZTAxZDFjMjI0MmY3ZTBjZTVlOWQwMzdmMWJjNzY3OThjZDY1OTcwYTE2ODYzYWVlIiwiaW50ZXJuYWxfc2VjcmV0IjoiMzhiODk0MDktMmVhMi00ODU0LTljOTgtYzk3MzI2OTQ5YzQ3In0.maqr-o6QujxkAYmtV8gD6z2JoQZIBK7cSOgDbRHS8aE
echo npx prisma migrate deploy
pause 