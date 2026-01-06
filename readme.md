# Silksong Guessr

**Silksong Guessr** is a web-based GeoGuessing game set in the world of *Hollow Knight* and its anticipated sequel, *Silksong*. Players must identify locations within the game world based on visual cues.

> **Note:** This project heavily inspired by "Hollow Guessr" and was developed as a technical assignment for the Computer Science Technical Course at **IFCE (Instituto Federal de Educação, Ciência e Tecnologia do Ceará)**.

## Features

-   **Interactive Map:** Guess locations on a detailed map of Hallownest.
-   **User Accounts:** Register, login, and track your progress.
-   **Google Login:** Seamless authentication using Google.
-   **Profile Statistics:** View your game history, high scores, and activity heatmap.
-   **Responsive Design:** optimized for both desktop and mobile devices.

## Project Structure

The project is divided into two main parts:

-   **Frontend:** Built with HTML, CSS (Vanilla), and JavaScript. It uses **Vite** as the build tool and development server.
-   **Backend:** A **Node.js** and **Express** API that handles authentication, game results, and user profiles.
-   **Database:** **MongoDB** is used to store user data and game records.

## How to Run Locally

### Prerequisites

-   Node.js (v14+ recommended)
-   MongoDB (installed and running locally or via Docker)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/luisggurgel/silksongGuessr.git
    cd silksongGuessr
    ```

2.  Install dependencies for both frontend and backend:
    ```bash
    npm install
    cd backend
    npm install
    cd ..
    ```

### Running the Application

This project uses a unified startup script to launch the Database, Backend API, and Frontend Server simultaneously.

**Windows (PowerShell):**
```powershell
./start.ps1
```

**Alternative (npm):**
```bash
npm run start
```

*Note: The application expects MongoDB to be available. The `start.ps1` script attempts to start a local MongoDB instance using the `tools/start_db.ps1` helper.*

### Configuration Required
The startup script `tools/start_db.ps1` contains a hardcoded path to the MongoDB executable. **You must verify and update this path to match your local installation before running.**

1.  Open `tools/start_db.ps1`.
2.  Update the `$mongodPath` variable:
    ```powershell
    $mongodPath = "C:\Path\To\Your\MongoDB\bin\mongod.exe"
    ```

### Accessing the App

-   **Frontend:** `http://localhost:5173`
-   **Backend API:** `http://localhost:5001`

## Academic Context

This project was developed by **Luis Guilherme** as part of the curriculum at **IFCE** for the Web Development 1 course, taught by Professor **José Roberto Bezerra**.

## License

This project is for educational purposes. *Hollow Knight* and *Silksong* are properties of Team Cherry.
