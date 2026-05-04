# TaskFlow

https://taskflow-teal-five.vercel.app/

TaskFlow is a modern, responsive task management application built with **React**, **Tailwind CSS**, and **Supabase**. It demonstrates a multi-layered authentication system and real-time database interactions[cite: 1].

## 🚀 Features

*   **Triple-Auth System**: Access the dashboard via an Admin Passcode, standard Email/Password, or as a Guest[cite: 1].
*   **Role-Based Access (RBAC)**: Supports "Admin" and "Guest" roles with dynamic UI changes and permission gating[cite: 1].
*   **Real-Time Tasks**: Create, toggle completion status, and delete tasks with instant UI updates[cite: 1].
*   **Status Indicators**: Uses a custom color-coding system where **Yellow** indicates "Wait/Incomplete" and **Green** indicates "Done/Complete"[cite: 1].
*   **Mobile-First Design**: A centered, responsive layout optimized for both desktop and mobile screens[cite: 1].

## 🛠️ Tech Stack

*   **Frontend**: React (TypeScript)[cite: 1]
*   **Styling**: Tailwind CSS[cite: 1]
*   **Backend/Auth**: Supabase[cite: 1]
*   **Environment Management**: Vite[cite: 1]

## 🔑 Authentication Modes

1.  **Admin Passcode**: Enter a specific numeric or text code (configured via `.env`) to automatically sign in with administrative credentials[cite: 1].
2.  **Email Login**: Standard secure login using Supabase Authentication[cite: 1].
3.  **Guest Mode**: Allows users to view the task list without an account, though they cannot add or modify tasks[cite: 1].

## ⚙️ Setup

1.  **Clone the repo**:
    ```bash
    git clone [https://github.com/yangsampson/taskflow.git](https://github.com/yangsampson/taskflow.git)
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root and add your Supabase and Admin credentials:
    
```env
    VITE_SUPABASE_URL=your_url
    VITE_SUPABASE_ANON_KEY=your_key
    VITE_ADMIN_PASSCODE=your_secret_passcode
    VITE_ADMIN_EMAIL=admin@example.com
    VITE_ADMIN_PASSWORD=admin_password
    ```

4.  **Run the app**:
    ```bash
    npm run dev
    ```
