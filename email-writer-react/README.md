# AI Inbox Assistant

An AI-powered email assistant that generates professional email replies using Groq LLMs and Spring AI.

## Features

- Generate AI-powered email replies
- Multiple tone options (Formal, Casual, Professional, Friendly, etc.)
- Email Classification (type detection)
- Dark Mode support
- Reply history tracking
- PDF export
- TXT export
- Chrome Extension integration
- Chart / Analytics Dashboard ()
- Responsive React UI

## Tech Stack

### Frontend
- React
- Material UI
- Axios
- Vite

### Backend
- Java 17
- Spring Boot
- Spring AI
- Groq API

### Deployment
- Vercel (Frontend)
- Render (Backend)

## Project Structure

```text
AI-Inbox-Assistant
├── email-writer-react
├── src
├── Email-Reply-Extension
└── pom.xml
```

## Environment Variables

Backend requires:

```env
GROQ_API_KEY=your_groq_api_key
```

## Run Frontend

```bash
cd email-writer-react
npm install
npm run dev
```

## Run Backend

```bash
export GROQ_API_KEY=your_api_key
./mvnw spring-boot:run
```

## API Endpoint

```http
POST /api/email/generate
```

Example:

```json
{
  "emailContent": "Please attend the meeting tomorrow.",
  "tone": "Formal"
}
```

## Live Demo

Frontend:
(Add Vercel URL)

Backend:
(Add Render URL)

## Author

Madhu Tomar
B.Tech AIML