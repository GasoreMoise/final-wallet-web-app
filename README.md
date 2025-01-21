# Wallet Web Application

A comprehensive personal finance management system built for tracking expenses, income, and budgeting across multiple accounts.

## Features

- Multi-account transaction tracking (Bank accounts, Mobile money, Cash)
- Income and expense management
- Custom category and subcategory creation
- Budget tracking with notifications
- Customizable reporting with date ranges
- Visual transaction summaries and analytics
- Responsive and modern UI/UX

## Tech Stack

### Backend
- FastAPI (Python)
- PostgreSQL
- SQLAlchemy ORM
- Pydantic for data validation
- JWT Authentication

### Frontend
- React
- TypeScript
- Material-UI (MUI)
- Redux Toolkit
- Chart.js for visualizations
- Axios for API communication

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 16+
- PostgreSQL 13+

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd wallet-web-app
```

2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate  # On Windows
pip install -r requirements.txt

# Set up environment variables
copy .env.example .env
# Edit .env with your database credentials

# Initialize the database
python -c "from app.database import Base, engine; from app import models; Base.metadata.create_all(bind=engine)"
```

3. Frontend Setup
```bash
cd frontend
npm install

# Set up environment variables
copy .env.example .env
# Update REACT_APP_API_URL to match your backend URL (e.g., http://localhost:8006/api)
```

### Running the Application

1. Start Backend (from the backend directory)
```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8006 --reload
```

2. Start Frontend (from the frontend directory)
```bash
npm start
```

3. Access the Application
- Frontend: http://localhost:3000
- Backend API docs: http://localhost:8006/docs

### First Time Setup

1. Register a new user at http://localhost:3000/register or via the API at http://localhost:8006/docs
2. Log in with your credentials
3. Start by:
   - Creating categories (e.g., Groceries, Rent, Salary)
   - Adding accounts (e.g., Bank Account, Cash)
   - Recording transactions
   - Setting up budgets

## Troubleshooting

1. Database Issues
   - Ensure PostgreSQL is running
   - Check database credentials in backend/.env
   - If schema issues occur, you can reset the database:
     ```python
     python -c "from app.database import Base, engine; from app import models; Base.metadata.drop_all(bind=engine); Base.metadata.create_all(bind=engine)"
     ```

2. Authentication Issues
   - Ensure you're using the correct API URL in frontend/.env
   - Check that the token is being properly stored and sent with requests
   - Try logging out and logging back in

3. Port Conflicts
   - If port 8006 is in use, you can change it in the backend start command
   - If port 3000 is in use, React will automatically suggest an alternative port

## License

MIT License

Links:
Backend:https://final-wallet-web-app-1.onrender.com
Frontend:https://final-wallet-web-app.vercel.app/categories
