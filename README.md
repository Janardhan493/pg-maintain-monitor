PG Maintain Monitor 🏠

A full-stack web application to manage PG/Hostel maintenance, track issues, store tenant details, and simplify admin work.
Built using Java Spring Boot, HTML/CSS/JS, and MySQL.

🚀 Features

📝 Add & manage tenant details

🛠️ Track PG issues (maintenance requests)

📊 Status updates – Pending / In-Progress / Completed

💾 MySQL database integration

🔐 Secure backend with Spring Boot

🌐 Clean and simple user-friendly UI

🛠️ Tech Stack
Frontend

HTML5

CSS3

JavaScript

Backend

Spring Boot (Java)

Spring MVC

Spring JPA / Hibernate

Database

MySQL Workbench

📂 Project Structure
pg-maintain-monitor/
│── pgdata-frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
│── pgdata/       # Backend Spring Boot
│   ├── src/
│   ├── pom.xml
│   └── application.properties
│
│── README.md

⚙️ Setup Instructions
1️⃣ Clone Repository
git clone https://github.com/Janardhan493/pg-maintain-monitor.git

2️⃣ Configure Database (MySQL)

Create a MySQL database:

CREATE DATABASE pgmonitor;

3️⃣ Update application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/pgmonitor
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update

4️⃣ Run Backend
mvn spring-boot:run

5️⃣ Run Frontend

Open:

pgdata-frontend/index.html

🔮 Future Enhancements

User login system

Automated email alerts

Payment & billing module

Dashboard with charts

Admin-only access panel

📧 Contact

Janardhan
📩 Email: janardhan59w@gmail.com

💻 GitHub: Janardhan493
