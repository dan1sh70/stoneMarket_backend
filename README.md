# Stone Market India - Backend

This is the Node.js and Express backend for the Stone Market India platform. It serves the REST APIs for Authentication, Vendor Management, Product Catalogs, Inquiries, Search, and Super Admin features.

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Joi
- **File Uploads:** AWS S3 via multer-s3
- **Email:** Nodemailer

## Prerequisites
Before running the application, ensure you have the following installed:
- Node.js (v18 or higher)
- MongoDB (running locally or a MongoDB Atlas URI)

## Installation & Setup

1. Clone the repository and navigate to the backend directory:
   ```bash
   cd stone-market-india/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root of the `backend` directory based on the `.env.example` file. 

## Environment Variables

The following API Keys and secrets must be defined in your `.env` file for the application to function correctly in production:

### Core Configuration
- `PORT` - The port the server will run on (Default: 5000)
- `NODE_ENV` - `development`, `test`, or `production`
- `MONGO_URI` - Your MongoDB connection string

### Security
- `JWT_SECRET` - A strong, random string used to sign JWT tokens
- `JWT_EXPIRY` - Token expiration time (e.g., `7d` or `24h`)

### Cloud Storage (AWS S3)
*Required for uploading profile pictures, gallery images, and product images.*
- `AWS_REGION` - The region of your S3 bucket (e.g., `ap-south-1`)
- `AWS_ACCESS_KEY_ID` - Your AWS IAM User Access Key
- `AWS_SECRET_ACCESS_KEY` - Your AWS IAM User Secret Key
- `AWS_S3_BUCKET` - The name of your designated S3 bucket

### Email Dispatch (SMTP)
*Required for system notifications and password resets.*
- `SMTP_HOST` - Your SMTP provider host (e.g., Amazon SES, SendGrid, Mailtrap)
- `SMTP_PORT` - SMTP Port (usually 587 or 2525)
- `SMTP_USER` - SMTP Username
- `SMTP_PASS` - SMTP Password

### External Services (Optional / Future Mocks)
- `FIREBASE_SERVICE_ACCOUNT` - Path to your Firebase service account JSON for push notifications.

## Running the Application

**Development Mode (with Nodemon):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

## Testing
The application uses Jest, Supertest, and mongodb-memory-server for isolated integration testing.

```bash
npm test
```
*Note: The first time you run the tests, it may take a few minutes to download the MongoDB in-memory binaries.*

## API Endpoints

The API is versioned at `/api/v1`. The major route categories are:

- `/api/v1/auth` - Registration, Login, OTP verification
- `/api/v1/vendors` - Vendor profile management and listing
- `/api/v1/products` - Product catalog CRUD
- `/api/v1/inquiries` - Lead generation and messaging between buyers and vendors
- `/api/v1/search` - Global text search and geospatial nearby search
- `/api/v1/admin` - Super admin dashboard, user management, moderation, and logs
- `/api/v1/ads` - Banner and popup advertisement delivery and tracking

Detailed endpoints and payload structures are documented in the provided Postman Collection.
