# BuddyBudget 💰

A modern, full-stack personal finance management application that helps you track expenses, manage budgets, and gain financial insights.

## ✨ Features

- **Expense Tracking**: Add, view, and manage your daily expenses
- **Budget Management**: Set and monitor budgets across different categories
- **Financial Insights**: Visualize your spending patterns with interactive charts
- **Multi-Currency Support**: Support for USD, INR, EUR, and GBP with currency icons
- **Theme Options**: Choose from Light, Dark, and Midnight themes
- **User Profile**: Manage your personal information and preferences
- **Responsive Design**: Beautiful UI that works on all devices

## 🛠️ Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Modern styling with CSS variables for theming
- **Vanilla JavaScript** - Interactive functionality
- **Chart.js** (if applicable) - Data visualization

### Backend
- **Java** - Core programming language
- **Spring Boot** - Backend framework
- **Maven** - Dependency management and build tool

## 📁 Project Structure

```
buddybudget/
├── frontend/
│   ├── index.html          # Landing/Dashboard page
│   ├── add.html            # Add expense page
│   ├── budget.html         # Budget management page
│   ├── insights.html       # Financial insights page
│   ├── profile.html        # User profile page
│   ├── css/
│   │   └── style.css       # Main stylesheet with theme support
│   ├── js/
│   │   └── app.js          # Application logic
│   └── assets/
│       └── icons/          # Currency icons (USD, INR, EUR, GBP)
└── backend/
    ├── pom.xml             # Maven configuration
    └── src/
        └── main/
            ├── java/
            │   └── com/buddybudget/
            │       └── BuddyBudgetApplication.java
            └── resources/
                └── application.properties
```

## 🚀 Getting Started

### Prerequisites
- **Java 17** or higher
- **Maven 3.6+**
- A modern web browser

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Build the project:
```bash
mvn clean install
```

3. Run the application:
```bash
mvn spring-boot:run
```

The backend server will start on `http://localhost:8080` (or as configured in `application.properties`).

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Open `index.html` in your browser, or use a local server:
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server -p 8000
```

3. Access the application at `http://localhost:8000`

## 🎨 Features in Detail

### Theme Switching
The application supports three beautiful themes:
- **Light Theme**: Clean and bright for daytime use
- **Dark Theme**: Easy on the eyes for low-light environments
- **Midnight Theme**: Deep, rich colors for night owls

### Currency Support
Switch between multiple currencies with visual icons:
- 🇺🇸 USD (US Dollar)
- 🇮🇳 INR (Indian Rupee)
- 🇪🇺 EUR (Euro)
- 🇬🇧 GBP (British Pound)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Created with ❤️ by Vinay

## 🔮 Future Enhancements

- [ ] Database integration for persistent storage
- [ ] User authentication and authorization
- [ ] Export data to CSV/PDF
- [ ] Recurring expense tracking
- [ ] Budget alerts and notifications
- [ ] Mobile app version
- [ ] API documentation with Swagger

---

**Note**: This is an active project under development. Features and documentation may be updated frequently.
