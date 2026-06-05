import { prisma } from "../lib/prisma";
import { loadPilotScenarioData } from "../lib/pilotData";

loadPilotScenarioData()
  .then((result) => {
    console.log(`Seeded operational records. Example signature: ${result.exampleSignature}...`);
    console.log(`Batches: ${result.batches.join(", ")}`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
