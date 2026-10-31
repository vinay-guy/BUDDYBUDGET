# BuddyBudget

A personal finance management application for tracking expenses, managing budgets, and viewing spending insights.

**Live Demo:** [https://vinay-guy.github.io/BUDDYBUDGET/](https://vinay-guy.github.io/BUDDYBUDGET/)

> Note: The live demo shows the frontend. Backend requires local setup.

## Features

- Expense tracking (add, view, manage daily expenses)
- Budget management across categories
- Spending insights with charts
- Multi-currency support (USD, INR, EUR, GBP)
- Theme options (Light, Dark, Midnight)
- User profile management
- Responsive design

## Tech Stack

**Frontend**
- HTML5, CSS3, Vanilla JavaScript
- Chart.js for data visualization

**Backend**
- Java, Spring Boot, Maven

## Project Structure

```
buddybudget/
├── frontend/
│   ├── index.html
│   ├── add.html
│   ├── budget.html
│   ├── insights.html
│   ├── profile.html
│   ├── css/
│   ├── js/
│   └── assets/
└── backend/
    ├── pom.xml
    └── src/
```

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- Modern web browser

### Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`.

### Frontend Setup

```bash
cd frontend
python -m http.server 8000
```

Open `http://localhost:8000`.

## License

MIT

## Author

Vinayak M Athadakar
