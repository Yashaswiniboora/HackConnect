# HackConnect
A collaborative platform to discover hackathons, find teammates, and build innovative projects.
HackConnect Backend

🛠️ Tech Stack

- Node.js
- Express.js
- JavaScript
- REST APIs
- JSON-based storage
- GitHub
- Render

⚙️ Backend Features

- Fetch hackathon details through REST APIs
- Add hackathons manually
- Import hackathons from an external data source
- Prevent duplicate hackathon entries
- Store hackathon data in JSON files
- Health check API
- Automatic periodic hackathon data import
- Deployed online using Render

🔗 API Endpoints

Get All Hackathons

GET /api/hackathons

Returns all available hackathon records.

Add a Hackathon

POST /api/hackathons

Adds a new hackathon to the system.

Import Hackathons

POST /api/hackathons/import

Imports hackathon data from the external feed.

Health Check

GET /api/health

Checks whether the backend is running successfully.

📦 Hackathon Data

Each hackathon contains information such as:

- Title
- Organizer
- Date
- Location
- Registration Link

🚀 Deployment

The backend is deployed using Render and can be accessed through a public API URL.

The frontend can communicate with the backend using the deployed API instead of "localhost".

📊 Current Status

- Backend: Completed
- REST APIs: Completed
- External hackathon importing: Completed
- Duplicate checking: Completed
- Deployment: Completed
- Frontend integration: Pending

🔮 Future Work

- Connect the backend with the frontend
- Add user profiles
- Implement matching recommendations
- Add skill-based teammate matching
- Move from JSON storage to persistent database storage
