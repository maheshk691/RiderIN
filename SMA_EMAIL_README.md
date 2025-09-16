# SMS & Email Deployment Guide

This backend supports both email (via Nodemailer) and SMS (via Kannel) verification. Follow these steps to deploy and configure your server:

---

## 1. Prepare Environment Variables

Add the following to your `.env` file (edit values as needed):

```
# Nodemailer (Email)
EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_email_password
EMAIL_FROM=YourApp <your@email.com>

# Kannel (SMS)
KANNEL_URL=http://your-kannel-server:13013/cgi-bin/sendsms
KANNEL_USER=your_kannel_user
KANNEL_PASS=your_kannel_password

# App
PORT=3000
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

---

## 2. Install Dependencies

If you haven’t already, install the required packages:

```sh
npm install nodemailer axios dotenv
```

---

## 3. Configure Email (Nodemailer) in Your Code

Example setup (in a file like `utils/email.ts`):

```js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendMail = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
};
```

---

## 4. Configure SMS (Kannel) in Your Code

Example setup (in a file like `utils/sms.ts`):

```js
import axios from 'axios';

export const sendSMS = async (to, text) => {
  const url = process.env.KANNEL_URL;
  const params = {
    username: process.env.KANNEL_USER,
    password: process.env.KANNEL_PASS,
    to,
    text,
  };
  await axios.get(url, { params });
};
```

---

## 5. Deploy the Server

- **Build (if using TypeScript):**
  ```sh
  npx tsc
  ```
- **Start the server:**
  ```sh
  npm run start
  ```
  or, if you have a process manager:
  ```sh
  pm2 start dist/server.js --name riderin-backend
  ```

---

## 6. Expose the Server

- Make sure your server is accessible (open firewall ports, set up reverse proxy if needed).
- Use a process manager like `pm2` for production reliability.

---

## 7. Test Email and SMS

- Use your API endpoints to trigger email and SMS sending.
- Check logs and provider dashboards for delivery status.

---

**Summary:**
Set up your `.env`, install dependencies, configure Nodemailer and Kannel in your code, build and start your server, and test the endpoints.

Let me know if you want a sample `.env.example` or deployment script!
