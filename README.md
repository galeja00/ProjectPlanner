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

#### 6. Create the `.env.local` File for Database Connection
- Create a file named `.env.local` in the root directory of the application.
- Add the following line to the file to configure the database connection using the CONNECT URL:
```plaintext
DATABASE_URL="CONNECT URL"
```
- Replace CONNECT URL with the following format:
```plaintext
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

#### 7. Create the `.env.local` File for Local Variables
- Create a file named `.env.local` in the root directory of the application.
- Add the following lines to configure authorization and image storage paths:
```plaintext
NEXTAUTH_SECRET="HASH"
IMAGE_DIRECTORY_PATH="PATH TO APPLICATION/project-planner/public/uploads/"
```
- For more information on `NEXTAUTH_SECRET` and `NEXTAUTH_URL`, visit [NextAuth.js Configuration Options](https://next-auth.js.org/configuration/options).
- To generate the `HASH` for `NEXTAUTH_SECRET`:
  - On Windows, you'll need to install OpenSSL. Follow the guide [here](https://monovm.com/blog/install-openssl-on-windows/).
  - Use the following command to generate the key:
    ```bash
    openssl rand -base64 32
    ```
  - Replace the word `HASH` with the generated key.

#### 8. Apply Migrations to the Database
- Open a terminal in the root directory of the project or navigate to it.
- Run the following command to apply migrations:
  ```bash
  npx prisma migrate dev
  ```
#### 9. Run the Application
- Open a terminal in the root directory of the project or navigate to it.
- Use the following commands to start the application:
  - For development:
    ```bash
    npm run dev
    ```
  - For deployment:
    ```bash
    npm run build
    npm start
    ```

