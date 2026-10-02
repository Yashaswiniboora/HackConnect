
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "data", "hackathons.json");
const FEED_FILE = path.join(__dirname, "data", "sample-feed.json");

const FEED_URL =
  process.env.HACKATHON_FEED_URL ||
  "https://hackathonsboard.netlify.app/events.json";

async function importHackathons() {
  try {
    console.log("Fetching external hackathons...");

    const response = await fetch(FEED_URL);

    if (!response.ok) {
      throw new Error(`External feed returned HTTP ${response.status}`);
    }

    const feed = await response.json();

    // Feed may contain an array directly or an "events" array.
    let events = Array.isArray(feed) ? feed : feed.events;

    // If external feed fails to provide events, use local sample data.
    if (!Array.isArray(events)) {
      console.log("Using local sample feed instead.");
      events = JSON.parse(fs.readFileSync(FEED_FILE, "utf8"));
    }

    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });

    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, "[]", "utf8");
    }

    const savedEvents = JSON.parse(
      fs.readFileSync(DATA_FILE, "utf8")
    );

    // Use event URL as the primary duplicate check.
    const existingKeys = new Set();

    for (const event of savedEvents) {
      if (event.registrationLink) {
        existingKeys.add(event.registrationLink.trim().toLowerCase());
      }
      if (event.title) {
        existingKeys.add(event.title.trim().toLowerCase());
      }
    }

    let added = 0;

    for (const event of events) {
      const title = String(event.title || event.name || "").trim();
      const organizer = String(
        event.organizer || event.source || "Unknown organizer"
      ).trim();

      const registrationLink = String(
        event.registrationLink || event.url || event.link || ""
      ).trim();

      if (!title) continue;

      const titleKey = title.toLowerCase();
      const urlKey = registrationLink.toLowerCase();

      if (
        existingKeys.has(titleKey) ||
        (urlKey && existingKeys.has(urlKey))
      ) {
        continue;
      }

      savedEvents.push({
        id: Date.now() + added,
        title,
        organizer,
        date: event.date || event.startsAt || "",
        location: event.location || event.locationLabel || "",
        registrationLink,
        source: event.source || "External feed",
        createdAt: new Date().toISOString()
      });

      existingKeys.add(titleKey);
      if (urlKey) existingKeys.add(urlKey);

      added++;
    }

    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify(savedEvents, null, 2),
      "utf8"
    );

    console.log(`Fetched ${events.length} events from external feed.`);
    console.log(`${added} new hackathons imported successfully!`);

    return added;
  } catch (error) {
    console.error("Import failed:", error.message);
    throw error;
  }
}

module.exports = importHackathons;