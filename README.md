## Project Planner
This is my bachelor's thesis project. The aim of the thesis is to identify a flexible model of the software process and implement it alongside other useful tools to facilitate collaboration among project members in solving problems and tasks. To address this challenge, I created a web application using Next.js and PostgreSQL for the database.

In this web application, users can create an unlimited number of projects. Each project is currently a Kanban project, which includes three basic boards where project members can manage tasks and groups of tasks. These boards consist of the Kanban board, the TimeTable (Gantt diagram), and the Backlog. Project members can be managed through the tools for Members and Teams, allowing for efficient assignment and tracking of responsibilities. This structure enhances collaboration and ensures that all project tasks are organized and easily accessible.

### How to Run?


#### 1. Install Node.js Runtime Environment
- **Version:** 20.9.0
- **Installation Guide:** Follow the instructions [here](https://nodejs.org/en/download/package-manager) to download and install Node.js.

#### 2. Install PostgreSQL Database
- **Version:** 16
- **Installation Guide:** Follow the instructions [here](https://www.postgresql.org/download/) to download and install PostgreSQL.

#### 3. Move the Source Code
- Move the source code, including the root directory named `project-planner`, to the location where the application will run.

#### 4. Create a Database for the Application
- Create a database for the application with a name of your choice.

#### 5. Install Necessary Packages
- Open a terminal and navigate to the root directory of the application.
- Run the following command to install all necessary packages:
  ```bash
  npm install
  ```
