# matcha-stock
**Next.js TypeScript TailwindCSS Prisma GraphQL PostgreSQL AWS Lambda**

Matcha-stock is a web application that tracks matcha product availability across multiple Japanese tea websites (currently Ippodo Tea, Sazen Tea, and MatchaJP) and sends notifications when items come back in stock.

Never miss out on your favorite matcha again, especially when matcha has been selling out in less than 5 minutes due to the recent craze. 

## How it works
The app uses automated monitoring to check product availability across Japanese matcha retailers. When an out-of-stock item becomes available the system sends instant email notifications to subscribers (using Resend). Next.js for the frontend, Prisma for database management, and queue-based processing.


