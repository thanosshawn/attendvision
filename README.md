# 👁️ AttendVision: Face Recognition Attendance System

**A streamlined solution for attendance tracking using facial recognition.**

[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?logo=tailwind-css)](https://tailwindcss.com/)
[![AI Powered by Genkit](https://img.shields.io/badge/AI%20by-Genkit-FF7F50?logo=google-cloud)](https://genkit.dev/)

## ✨ Features

*   **Effortless Attendance Tracking:**
    *   📸 **Real-time Face Recognition:** Employees can check-in and check-out by simply looking at the camera.
*   **Intuitive User Interface:**
    *   📱 **Responsive Design:** Seamless experience across devices.
    *   🌓 **Theme Toggle:** Customize the look and feel with light and dark modes.
*   **Local Data Storage:** Employee and attendance data are stored locally in the browser's `localStorage`.

## 🚀 Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/attend-vision.git
    cd attend-vision
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Set up environment variables:**
    *   Create a `.env` file in the root of the project.
    *   You may need to configure Genkit/Google AI related environment variables if not already set up for your environment (e.g., `GOOGLE_API_KEY`).
4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will be accessible at `http://localhost:9002` (or the port specified by your environment).

## Employee Data

Employee data (including name, ID, and face image URI) is managed via `localStorage`. For the face recognition to work, employee data needs to be present. This might involve:
*   Manually adding data to `localStorage` via browser developer tools.
*   Using a script or a temporary UI (not included by default in this simplified version) to populate initial employee data.

The `CameraView` component expects employee data to be available through the `DataContext` for matching and recording attendance.

## 🛠️ Built With

*   [Next.js](https://nextjs.org/)
*   [TypeScript](https://www.typescriptlang.org/)
*   [Tailwind CSS](https://tailwindcss.com/)
*   [React](https://react.dev/)
*   [Genkit](https://genkit.dev/) (for AI-powered face recognition and detection)
*   [ShadCN UI](https://ui.shadcn.com/) (for UI components)
*   [Lucide React](https://lucide.dev/) (for icons)

## 🤝 Contributing

Contributions are welcome! Please fork the repository, create a new branch, make your changes, and submit a pull request.

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).
