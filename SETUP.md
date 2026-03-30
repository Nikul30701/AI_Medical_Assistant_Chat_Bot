# AI Medical Document Analyzer - Setup Guide

## Backend Setup (Django)

### Prerequisites
- Python 3.8+
- pip

### Installation

1. **Navigate to Backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
   (Create requirements.txt if it doesn't exist)

3. **Setup database (SQLite for development):**
   ```bash
   # Run the setup script
   setup.bat  # on Windows
   # or
   bash setup.sh  # on Linux/Mac
   
   # Or manually:
   python manage.py makemigrations accounts chat documents
   python manage.py migrate
   ```

4. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

5. **Start the server:**
   ```bash
   python manage.py runserver
   ```

The server will be available at `http://localhost:8000`

## Frontend Setup (React)

### Prerequisites
- Node.js 16+
- npm

### Installation

1. **Navigate to Frontend directory:**
   ```bash
   cd Frontend/MedicalAI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Environment Variables

### Frontend
Create `.env` file in `Frontend/MedicalAI/`:
```
VITE_API_URL=http://localhost:8000
```

### Backend
Create `.env` file in `Backend/`:
```
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=medical_ai
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432
GROQ_API_KEY=your-groq-api-key
```

## Common Issues & Solutions

### 500 Internal Server Error
1. **Backend not running:** Make sure Django server is running on port 8000
2. **Database not migrated:** Run `python manage.py migrate`
3. **Missing dependencies:** Install all required Python packages
4. **CORS issues:** Check that `http://localhost:5173` is in `CORS_ALLOWED_ORIGINS`

### Frontend Issues
1. **Missing dependencies:** Run `npm install`
2. **Module not found:** Check that all imports are correct
3. **API connection failed:** Ensure backend is running and CORS is configured

## API Endpoints

### Authentication
- `POST /api/accounts/register/` - Register new user
- `POST /api/accounts/login/` - Login user
- `POST /api/accounts/logout/` - Logout user
- `GET /api/accounts/me/` - Get current user
- `POST /api/accounts/token/refresh/` - Refresh JWT token

### Documents
- `GET /api/documents/` - List documents
- `POST /api/documents/` - Upload document
- `GET /api/documents/{id}/` - Get document
- `DELETE /api/documents/{id}/` - Delete document

### Chat
- `GET /api/chat/` - List chat sessions
- `POST /api/chat/` - Create chat session
- `GET /api/chat/{id}/` - Get chat messages
- `POST /api/chat/{id}/` - Send message

## Development Tips

1. **Use browser dev tools** to check network requests
2. **Check console** for JavaScript errors
3. **Use Django debug toolbar** for backend debugging
4. **Keep frontend and backend servers running** simultaneously

## Production Deployment

For production, you'll need to:
1. Switch to PostgreSQL database
2. Set `DEBUG=False`
3. Configure proper CORS settings
4. Use HTTPS
5. Set up proper static file serving
