# VK Aura - MERN Stack Project

A complete MERN stack (MongoDB, Express, React, Node.js) application for user registration, login, profile management, cloud image uploads, and email services.

---

## 📁 Project Structure

```
vk_aura_mernproject/
├── backend/
│   ├── .env                # Add MongoDB URI here
│   ├── src/
│   │   └── .env            # Add the same MongoDB URI here
│   └── utils/
│       ├── email1.js
│       ├── email2.js
│       ├── email3.js
│       └── email4.js       # Add email and app password in all 4 files
│
├── frontend/
│   └── src/pages/EditProfile.jsx  # Add Cloudinary values here
```

---

## 🔧 Setup Instructions

### ✅ 1. MongoDB Configuration

MongoDB URI must be placed in **both** the following `.env` files:

- `backend/.env`
- `backend/src/.env`

Paste your MongoDB connection string like this:

```env
MONGO_URL=your_mongodb_connection_string
```

Make sure the URI is **identical** in both files.

---

### ✅ 2. Email Configuration

Go to the following folder:

```
backend/utils/
```

You will see four files:

- `email1.js`
- `email2.js`
- `email3.js`
- `email4.js`

In **each of these files**, find the email transport configuration and replace with your own email and app password:

```js
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your_email@gmail.com",
    pass: "your_app_password"
  }
});
```

> Use an **App Password** if you're using Gmail (not your regular login password).

---

### ✅ 3. Cloudinary Configuration (Frontend)

Open this file:

```
frontend/src/pages/EditProfile.js
```

Scroll to the top and replace the Cloudinary info like this:

```js
const cloudName = "your_cloudinary_cloud_name";
const uploadPreset = "your_upload_preset_name";
```

> You do **not** need to set any `.env` for frontend. Just update these values directly in the file.

---

## 📦 Dependency Installation

### Backend

```bash
cd backend
npm install
```

### Frontend

```bash
cd frontend
npm install
```

---

## 🚀 Running the Application

### Using Split Terminal (Recommended in VS Code)

1. Open terminal: `Ctrl + ~`
2. Split terminal: `Ctrl + Shift + 5`

#### Terminal 1 – Backend

```bash
cd backend
npm start
```

Server will run at: `http://localhost:5000`

#### Terminal 2 – Frontend

```bash
cd frontend
npm start
```

Client will run at: `http://localhost:3000`

---

## ✅ Features

- User Registration & Login
- JWT Authentication
- Profile Editing
- Image Upload via Cloudinary
- Email services via 4 configurations
- Responsive UI

---

## 🛠 Technologies Used

- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT, bcrypt
- **File Uploads**: Cloudinary
- **Email**: Nodemailer (4 separate configs)

---

## ⚠️ Important Notes

- `.env` files are already created — just paste the MongoDB URI in both.
- You **must update all 4 email files** in `backend/utils/` with correct email and app password.
- Cloudinary values are hardcoded in `EditProfile.jsx`, edit directly there.
- Do **not** change any folder structure or filenames.

---

## 👨‍💻 Author

Built by [tharshihecker](https://github.com/tharshihecker)

---

## 📝 License

MIT License
