import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Quarterly refresh for top 100 popular destinations
// Runs on 1st of each month at midnight UTC
// The action checks if it's a quarterly month (Jan/Apr/Jul/Oct)
crons.monthly(
    "refresh-top-100-quarterly",
    { day: 1, hourUTC: 0, minuteUTC: 0 },
    internal.update_all.refreshTop100DestinationsInternal
);

// Weekly job to update top 100 flags (every Sunday at 2am UTC)
crons.weekly(
    "update-top-100-flags",
    { dayOfWeek: "sunday", hourUTC: 2, minuteUTC: 0 },
    internal.destinations.updateTop100Flags
);

export default crons;
