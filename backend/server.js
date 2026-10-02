
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const importHackathons = require("./importer");

const app = express();
const PORT = process.env.PORT || 5000;

// JSON file storage
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "hackathons.json");

app.use(cors());
app.use(express.json());

// Create storage folder and file if missing
function initializeStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, "[]", "utf8");
  }
}

// Read hackathons
function readHackathons() {
  initializeStorage();

  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Read error:", error.message);
    return [];
  }
}

// Save hackathons
function saveHackathons(hackathons) {
  initializeStorage();

  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(hackathons, null, 2),
    "utf8"
  );
}

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to HackConnect Backend!",
    status: "Running successfully"
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "HackConnect API is working!"
  });
});

// Get all hackathons
app.get("/api/hackathons", (req, res) => {
  const hackathons = readHackathons();

  res.json({
    success: true,
    count: hackathons.length,
    data: hackathons
  });
});

// Add hackathon manually
app.post("/api/hackathons", (req, res) => {
  const { title, organizer, date, location, registrationLink } = req.body;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof organizer !== "string" ||
    !organizer.trim()
  ) {
    return res.status(400).json({
      success: false,
      message: "Hackathon title and organizer are required."
    });
  }

  const hackathons = readHackathons();

  const titleExists = hackathons.some(
    event =>
      typeof event.title === "string" &&
      event.title.trim().toLowerCase() === title.trim().toLowerCase()
  );

  if (titleExists) {
    return res.status(409).json({
      success: false,
      message: "This hackathon already exists."
    });
  }

  const newHackathon = {
    id: Date.now(),
    title: title.trim(),
    organizer: organizer.trim(),
    date: date || "",
    location: location || "",
    registrationLink: registrationLink || "",
    createdAt: new Date().toISOString()
  };

  try {
    hackathons.push(newHackathon);
    saveHackathons(hackathons);

    res.status(201).json({
      success: true,
      message: "Hackathon saved successfully!",
      data: newHackathon
    });
  } catch (error) {
    console.error("Save error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to save hackathon."
    });
  }
});

// Prevent overlapping imports
let importRunning = false;

// Import external hackathons
async function runImport() {
  if (importRunning) {
    console.log("Import already running. Skipping this request.");

    return {
      success: false,
      message: "An import is already running."
    };
  }

  importRunning = true;

  try {
    const added = await importHackathons();

    console.log(`${added} new hackathons imported successfully.`);

    return {
      success: true,
      added
    };
  } catch (error) {
    console.error("Import failed:", error.message);

    return {
      success: false,
      message: error.message
    };
  } finally {
    importRunning = false;
  }
}

// Manually trigger import
app.post("/api/hackathons/import", async (req, res) => {
  const result = await runImport();

  if (!result.success) {
    return res.status(500).json(result);
  }

  res.json({
    success: true,
    message: "Hackathon import completed.",
    added: result.added,
    count: readHackathons().length
  });
});

// Start server
initializeStorage();

app.listen(PORT, () => {
  console.log(`HackConnect server running at http://localhost:${PORT}`);

  // Initial import when server starts
  runImport();

  // Repeat import every 6 hours
  setInterval(() => {
    console.log("Starting scheduled hackathon import...");
    runImport();
  }, 6 * 60 * 60 * 1000);
});