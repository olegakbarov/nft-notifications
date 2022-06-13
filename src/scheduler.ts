import Bree from "bree";
import path from "node:path";
import ms from "ms";

export const scheduler = new Bree({
  root: path.join(__dirname, "jobs"),
  defaultExtension: "ts",
  jobs: [
    {
      name: "fetchLatestCollections",
      interval: "15s",
    },
    {
      name: "fetchLatestSalesForCollection",
      interval: "30s",
      closeWorkerAfterMs: ms("30s"),
    },
  ],
  errorHandler: (error, workerMetadata) => {
    // workerMetadata will be populated with extended worker information only if
    // Bree instance is initialized with parameter `workerMetadata: true`
    if (workerMetadata.threadId) {
      console.info(
        `There was an error while running a worker ${workerMetadata.name} with thread ID: ${workerMetadata.threadId}`
      );
    } else {
      console.info(
        `There was an error while running a worker ${workerMetadata.name}`
      );
    }

    console.error(error);
  },
});
