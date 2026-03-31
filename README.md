# AI Medical Document Analyzer + Chat

A full-stack application for AI-powered medical document analysis with real-time chat capabilities.

## 🚀 Features

- **Document Upload**: Support for PDF, JPG, JPEG, PNG, and DOCX files
- **AI Analysis**: Automated medical report analysis using Groq AI
- **Real-time Chat**: WebSocket-powered chat interface for document queries
- **User Authentication**: JWT-based secure authentication
- **Responsive UI**: Modern React frontend with Tailwind CSS
- **Document Management**: Dashboard with search, filter, and pagination

## 🛠 Tech Stack

### Frontend
- **React 18** with hooks
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **RTK Query** for API calls

### Backend
- **Django 5** with REST Framework
- **Django Channels** for WebSocket support
- **PostgreSQL** database
- **JWT Authentication**
- **Groq AI** integration for document analysis

### Infrastructure
- **Daphne** ASGI server for WebSocket support
- **Docker** ready (optional)

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (or SQLite for development)

### Backend Setup

```bash
# Clone repository
git clone <repository-url>
cd "AI Medical Document Analyzer + Chat/Backend"

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Environment variables
cp .env.example .env
# Edit .env with your settings:
# - DATABASE_URL
# - GROQ_API_KEY
# - SECRET_KEY

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

### Frontend Setup

```bash
cd "AI Medical Document Analyzer + Chat/Frontend/MedicalAI"

# Install dependencies
npm install

# Environment variables
cp .env.example .env
# Edit .env:
# - VITE_API_URL=http://localhost:8000/api
# - VITE_WS_URL=ws://localhost:8000

# Start development server
npm run dev
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend (ASGI server for WebSocket support):**
```bash
cd Backend
daphne -b 127.0.0.1 -p 8000 My_Porject.asgi:application
```

**Terminal 2 - Frontend:**
```bash
cd Frontend/MedicalAI
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **WebSocket**: ws://localhost:8000/ws/

### Production Mode

```bash
# Backend
daphne -b 0.0.0.0 -p 8000 My_Porject.asgi:application

# Frontend (build)
npm run build
# Serve dist/ folder with nginx or similar
```

## 📡 API Endpoints

### Authentication
- `POST /api/accounts/register/` - User registration
- `POST /api/accounts/login/` - User login
- `POST /api/accounts/token/refresh/` - Refresh JWT token
- `GET /api/accounts/me/` - Get current user

### Documents
- `GET /api/documents/` - List documents (paginated)
- `POST /api/documents/upload/` - Upload new document
- `GET /api/documents/{id}/` - Get document details
- `DELETE /api/documents/{id}/` - Delete document

### Chat
- `GET /api/chat/{document_id}/messages/` - Get chat history
- `WS /ws/chat/{document_id}/` - WebSocket chat connection

## 🔌 WebSocket Usage

Connect to WebSocket for real-time chat:
```javascript
const ws = new WebSocket(
  `ws://localhost:8000/ws/chat/${documentId}/?token=${accessToken}`
);

ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};

// Send message
ws.send(JSON.stringify({ message: 'Your question here' }));
```

## 🏗 Project Structure

```
AI Medical Document Analyzer + Chat/
├── Backend/
│   ├── apps/
│   │   ├── accounts/        # User authentication
│   │   ├── documents/       # Document upload & analysis
│   │   └── chat/            # WebSocket chat & messaging
│   ├── My_Porject/          # Django settings & ASGI config
│   └── manage.py
│
└── Frontend/
    └── MedicalAI/
        ├── src/
        │   ├── components/    # UI components
        │   ├── pages/         # Page components
        │   ├── store/         # Redux slices
        │   ├── services/      # API & WebSocket hooks
        │   └── hooks/         # Custom React hooks
        └── package.json
```

## 🔐 Environment Variables

### Backend (.env)
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgres://user:pass@localhost:5432/medicalai
GROQ_API_KEY=your-groq-api-key
GROQ_MODEL=llama-3.3-70b-versatile
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
VITE_WS_URL=ws://localhost:8000
```

## 🧪 Testing

```bash
# Backend tests
cd Backend
python manage.py test

# Frontend tests
cd Frontend/MedicalAI
npm test
```

## 📄 License

This project is licensed under the MIT License.

## ⚕️ Medical Disclaimer

This AI-powered medical document analyzer is for **informational purposes only**. It does not provide medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for medical decisions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📧 Support

For support, email support@medanalyzer.com or open an issue on GitHub.

---

**Made with ❤️ for better healthcare**
