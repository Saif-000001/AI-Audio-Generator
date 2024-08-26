# AI Audio Generator

## Project Description
AI Audio Generator is a web application designed to convert PDF documents into audio files using advanced Text-to-Speech (TTS) technology. Users can upload PDF files through a React-based frontend interface, and the backend, built with FastAPI, handles the processing. The backend extracts text from PDFs using `easyocr` for Optical Character Recognition (OCR) and generates high-quality audio files using the `TTS` library. This project is containerized with Docker, ensuring consistent deployment across different environments.

## Text-to-Speech (TTS) Repository
For the Text-to-Speech functionality, we leverage the powerful TTS engine available at [Coqui-AI TTS Repository](https://github.com/coqui-ai/TTS). This allows us to convert text from PDF files into high-quality audio, enhancing accessibility and usability for our users.

## Technologies Used
- **Frontend**: React, Vite
- **Backend**: FastAPI, Python
- **Deployment**: Docker
- **Database**: SQLite
- **Firebase**: Firebase Authentication
- **Other Libraries**: easyocr, pymupdf, TTS

## Project Structure

```plaintext
```plaintext
AI-Audio-Generator/
│
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── API/
│   │   │   └── API.jsx
│   │   ├── assets/
│   │   ├── Firebase/
│   │   │   └── Firebase.Config.js
│   │   ├── Layout/
│   │   │   └── Root.jsx
│   │   ├── Pages/
│   │   │   ├── Header/
|   |   |   |   ├── Header.jsx
|   │   │   │   ├── Share/
|   |   │   │   │   ├── Dashboard/
|   |   │   │   │   │   ├── Dashboard.jsx
|   |   │   │   │   │   ├── DeleteTest.jsx
|   |   │   │   │   │   └── Store.jsx
|   |   │   │   │   ├── Home/
|   |   │   │   │   │   └── Home.jsx
|   |   |   ├── Register/
|   |   |   |     └── Register.jsx
|   │   │   └── Login/
│   │   │       └── Login.jsx
│   │   ├── Providers/
│   │   │   └── AuthProvider.jsx
│   │   ├── Router/
│   │   │   ├── PrivateRoute/
│   │   │   │   └── PrivateRoute.jsx
│   │   │   └── Router.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .dockerignore
│   ├── .env.local
│   ├── .gitignore
│   ├── Dockerfile
│   ├── eslint.config.js
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── .venv/
│   ├── app/
│   │   ├── __pycache__/
│   │   ├── __init__.py
│   │   ├── crud.py
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   └── schemas.py
│   ├── temp/
│   │   ├── audio/
│   │   │   ├── Audio_en_4...wav
│   │   │   └── Audio_en_6...wav
│   │   └── uploads/
│   │       ├── Bn.pdf
│   │       ├── En.pdf
│   │       └── ja.pdf
│   ├── .dockerignore
│   ├── .gitignore
│   ├── Dockerfile
│   ├── requirements.txt
│   └── sql_app.db
│
├── .gitignore
├── docker-compose.yml
├── package-lock.json
├── package.json
├── postcss.config.js
├── README.md
└── tailwind.config.js
```
Open your project in Visual Studio Code, then open a new terminal. In the terminal, navigate to the frontend directory using the command `cd frontend`, and then install the project dependencies by running `npm install`. Instructs the user to create a `.env.local` file and provides the exact Firebase configuration values as placeholders. The user is directed to replace them with their actual Firebase project configuration details from the Firebase Console.

#### 2. Build and Run the Docker Containers

```bash
docker-compose up --build
```
This command builds the images for the frontend and backend if they don't exist and starts the containers. The backend is available at `http://localhost:8000/` and the frontend at `http://localhost:3000/`.

#### 3. Viewing the Application

Open a browser and navigate to `http://localhost:3000/` to view the React application. It should display a message fetched from the FastAPI backend.

## Stopping the Application
To stop the application and remove containers, networks, and volumes created by `docker-compose up`, you can use:

```bash 
docker-compose down -v
```
