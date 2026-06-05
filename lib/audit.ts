import { prisma } from "./prisma";
import { sha256 } from "./security";

type AuditInput = {
  entityType: string;
  entityId: string;
  action: string;
  details: unknown;
};

export async function createAuditLog(input: AuditInput) {
  const previous = await prisma.auditLog.findFirst({
    orderBy: { createdAt: "desc" },
    select: { currentHash: true }
  });
  const createdAt = new Date();
  const details = typeof input.details === "string" ? input.details : JSON.stringify(input.details);
  const currentHash = sha256(
    `${input.entityType}${input.entityId}${input.action}${details}${previous?.currentHash ?? ""}${createdAt.toISOString()}`
  );

  return prisma.auditLog.create({
    data: {
      ...input,
      details,
      previousHash: previous?.currentHash,
      currentHash,
      createdAt
    }
  });
}
