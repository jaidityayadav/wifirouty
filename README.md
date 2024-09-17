# Network Traffic Monitor

A simple React-based application to monitor and display network traffic in real-time, using Node.js, Express, and pcap for packet capture.

## Overview

This project captures network traffic on specified interfaces, focusing on HTTP and HTTPS traffic, and displays this information in a web interface. It includes features like:
- Real-time packet capturing.
- DNS reverse lookup for destination IPs.
- Pagination for displaying traffic data.
- Simulated website data for demonstration.

## Technologies Used

- **React.js** with TypeScript for the front end.
- **Node.js** and **Express** for the backend server.
- **pcap** for network packet capturing.
- **CORS** for cross-origin resource sharing.
- **Tailwind CSS** for styling (assumed based on class usage).

## Preview

![Screen](https://github.com/user-attachments/assets/2cecb0db-a4ba-4741-8313-0d2133b254b4)


### Prerequisites

- Node.js installed on your system.
- Ensure you have permissions to capture network traffic.

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://www.github.com/krishmakhijani/wifirouty
   cd wifirouty
   ```

2. **Install dependencies:**
```bash
npm install
```
3. **Start the development server:**
```bash
npm run dev
```
This command will start both the React development server and the Node.js server.
Access the application:
Open your browser and navigate to http://localhost:3000 (or the port specified by your React development server).

Backend Server

```bash
cd backend
```

```bash
sudo npx ts-node server/index.ts

```

Note
Running this application might require administrative privileges due to the use of pcap.
The packet capture filter in index.ts is currently set to capture only TCP traffic on ports 80 and 443. Adjust this filter as needed.

License
MIT License (LICENSE)