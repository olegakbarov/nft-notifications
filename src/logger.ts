import { parentPort } from "node:worker_threads";
import process from "node:process";

export const log = (text: string) => {
  if (parentPort) parentPort.postMessage(text);
};

export const end = () => {
  // signal to parent that the job is done
  if (parentPort) parentPort.postMessage("done");
  // eslint-disable-next-line unicorn/no-process-exit
  else process.exit(0);
};
