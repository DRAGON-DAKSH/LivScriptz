# LivScriptz 0.5

A real-time collaborative code editor that lets multiple users write, edit, and run code together — live — directly in the browser. Built with Node.js, Express, Socket.io, and powered by the JDoodle API for code execution.

---

## Features

- 🔴 **Live collaboration** — multiple users edit code in the same room, in real time
- 💬 **In-room chat** — communicate with collaborators without leaving the editor
- 📁 **Multi-file support** — add, rename, remove, and switch between files
- 🌐 **Multi-language support** — change language per file (powered by JDoodle)
- ▶️ **Run code** — execute code and broadcast output to all room members
- 🎨 **User colors** — each collaborator gets a unique color identity
- 🔒 **Secure API proxy** — JDoodle credentials stay on the server, never exposed to the client

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Real-time | Socket.io |
| Code Execution | JDoodle API (via server-side proxy) |
| Frontend | HTML/CSS/JS (`public/index.html`) |
| Config | dotenv |

---

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)
- A free [JDoodle account](https://www.jdoodle.com/) for API credentials

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/livscriptz.git
cd livscriptz
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Set Up Environment Variables

Copy the example env file and fill in your JDoodle credentials:

```bash
cp .env.example .env
```

Now open `.env` and replace the placeholders:

```
JDOODLE_CLIENT_ID=your_actual_client_id
JDOODLE_CLIENT_SECRET=your_actual_client_secret
```

> 💡 Get your free credentials at [jdoodle.com](https://www.jdoodle.com/) → Sign up → API

---

### 4. Start the Server

```bash
node server.js
```

You should see:

```
✅ LivScriptz running at:
   Local:   http://localhost:3000
   WiFi:    http://192.168.x.x:3000
   ngrok:   run "ngrok http 3000" for public URL
```

---

### 5. Open in Browser

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Collaborating with Others

### On the same WiFi network

Share the **WiFi URL** printed in the terminal (e.g. `http://192.168.1.5:3000`) with anyone on the same network.

### Over the internet (public URL)

Use [ngrok](https://ngrok.com/) to expose your local server:

```bash
npx ngrok http 3000
```

Share the generated `https://xxxx.ngrok.io` URL with anyone — no deployment needed.

---

## Project Structure

```
livscriptz/
├── public/
│   └── index.html       # Frontend UI
├── .env                 # Your secrets (do NOT commit this)
├── .env.example         # Template for environment variables
├── .gitignore
├── package.json
├── package-lock.json
└── server.js            # Express + Socket.io backend
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `JDOODLE_CLIENT_ID` | Your JDoodle API client ID |
| `JDOODLE_CLIENT_SECRET` | Your JDoodle API client secret |

---

## Contributing

Pull requests are welcome! If you find a bug or want to suggest a feature, feel free to open an issue.

---

## License

ISC
