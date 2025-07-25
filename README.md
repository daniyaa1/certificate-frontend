# 🎓 Certificate Generator Frontend – React + TypeScript

This is the frontend for the Certificate Generator web app. It allows users to upload a background certificate image and a CSV of participant data, and then download auto-generated PDF certificates.

---

## 🌐 Live App

🖥️ Try it here: [certificate-frontend-eight.vercel.app](https://certificate-frontend-eight.vercel.app/)

---

## ⚛️ Tech Stack

- React (with TypeScript)
- HTML & Tailwind CSS
- Axios (for API calls)
- File handling and CSV parsing
- Responsive Design

---

## 🛠️ Features

- Upload a **certificate background image**
- Upload a **CSV file** with participant details (name, course, date, etc.)
- Click “Generate” to automatically receive downloadable PDFs
- Friendly UI with error handling and validations
- Mobile responsive

---

## 🔗 Backend API Integration

This frontend connects to the deployed backend:

👉 [certificate-backend-production.up.railway.app](https://certificate-backend-production.up.railway.app)

Make sure CORS is enabled on backend to allow communication.

---

## 🧪 Usage Instructions

1. Open the [Live App](https://certificate-frontend-eight.vercel.app/)
2. Upload your certificate background image (JPG/PNG).
3. Upload a CSV file with student data (Name, Course, Date).
4. Click on **Generate Certificates**.
5. A ZIP file will automatically download containing all personalized certificates in PDF format.

---

## 🧾 Example CSV Format
Name,Course,Date
John Doe,Web Dev Bootcamp,July 2025
Jane Smith,Data Science 101,July 2025



---

## 🧑‍💻 Local Setup

```bash
git clone https://github.com/your-username/certificate-frontend.git
cd certificate-frontend
npm install
npm start


Folder Structure
certificate-frontend/
├── public/
├── src/
│   ├── components/
│   │   └── CertificateGenerator.tsx
│   └── App.tsx
├── tailwind.config.js
├── package.json
└── tsconfig.json




Built with ❤️ by Daniya Ishteyaque
GitHub: @daniyaa1



