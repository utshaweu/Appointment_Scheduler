# Here’s a README.md file with full instructions for setting up and using the Appointment Scheduler application. This document covers prerequisites, setup steps, and usage details.

## Appointment Scheduler Application

This project is a simple Appointment Scheduler built with React (TypeScript), Firebase (Firestore, Authentication, Storage), and Bootstrap for responsive design. Users can register/login, view/search other users, schedule appointments, and manage appointments (accept, decline, or cancel). Appointments can optionally include an audio message recorded by the scheduler.

### Features

1.  User Authentication: Registration and login using Firebase Authentication.
2.  User Interaction: View and search other users, schedule appointments with other users.
3.  Appointment Management: View, search, and filter appointments. Accept, decline, or cancel appointments.
4.  Audio Message: Optionally add an audio message to an appointment (file upload).

### Setup and Installation

Follow these steps to set up the project locally.

1. Clone the repository <br/>
   git clone https://github.com/your-username/appointment-scheduler.git <br/>
   cd appointment-scheduler

2. Install dependencies
   Install all the project dependencies using npm:
   npm install

3. Start the development server
   npm start

The project will be compiled and served at http://localhost:3000.

### How to Use the Application

1. User Registration & Login
<ul>
    <li>On the homepage, users can register a new account using an email and password.</li>
    <li>After registration, users can log in with the same credentials.</li>
</ul>

2. Viewing Users
<ul>
    <li>After logging in, navigate to the Dashboard page (/dashboard).</li>
    <li>You can view the list of all users and search for specific users using the search bar.</li>
</ul>

3. Scheduling Appointments
<ul>
    <li>When you click the user list then you have a scheduled appointment form.</li>
    <li>Fill in the details for the appointment (title, description, date, and time).</li>
    <li>Optionally, you can upload an audio message that will be attached to the appointment.</li>
    <li>After submitting the form, the appointment will be saved in the system.</li>
</ul>

4. Managing Appointments
<ul>
    <li>Navigate to the Dashboard page (/dashboard) to view all your appointments.</li>
    <li>The appointments are categorized into Upcoming Appointments and Past Appointments.</li>
    <li>You can filter appointments by status (pending, accepted, declined) and search for specific appointments using the search bar.</li>
    <li>For pending appointments, you can accept or decline the appointment directly from the list.</li>
    <li>You can also cancel appointments before they are scheduled.</li>
</ul>


### Demo username and password

-   **Username:** utshaw
-   **Password:** 123456