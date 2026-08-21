import { getPrismaClient } from "./prisma";

const SHEET_ID = process.env.REQUESTS_SHEET_ID || "1Wm8ZkgB4ea2eLWRPrR2k_fpL5HEtD18eUf1JcSt2Fvk";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv`;

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // skip
    } else {
      field += c;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function parseVNDate(raw: string | undefined, fallbackYear: number): Date | undefined {
  if (!raw) return undefined;
  const parts = raw.trim().split("/");
  if (parts.length < 2) return undefined;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parts[2] ? parseInt(parts[2], 10) : fallbackYear;
  if (!day || !month || !year) return undefined;
  const d = new Date(Date.UTC(year, month - 1, day));
  return isNaN(d.getTime()) ? undefined : d;
}

function s(val: string | undefined): string | undefined {
  if (val === undefined) return undefined;
  const trimmed = val.trim();
  return trimmed === "" ? undefined : trimmed;
}

export interface SyncSummary {
  totalProposals: number;
  created: number;
  updated: number;
  totalItems: number;
}

export async function syncPurchaseRequestsFromSheet(): Promise<SyncSummary> {
  const res = await fetch(CSV_URL, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch sheet CSV: ${res.status}`);
  }
  const csvText = await res.text();
  const rows = parseCSV(csvText);

  // Row 0 = merged section header, Row 1 = actual column header
  const dataRows = rows.slice(2).filter((r) => s(r[0]) !== undefined);

  const groups = new Map<string, string[][]>();
  for (const r of dataRows) {
    const proposalCode = s(r[2]);
    if (!proposalCode) continue;
    if (!groups.has(proposalCode)) groups.set(proposalCode, []);
    groups.get(proposalCode)!.push(r);
  }

  const prisma = getPrismaClient();
  const admin = await prisma.user.findUnique({ where: { username: "admin" } });
  if (!admin) throw new Error("Admin user not found");

  let created = 0;
  let updated = 0;
  let totalItems = 0;

  for (const [proposalCode, groupRows] of groups) {
    const head = groupRows[0];
    const receivedDate = parseVNDate(s(head[3]), new Date().getFullYear());
    const fallbackYear = receivedDate ? receivedDate.getUTCFullYear() : new Date().getFullYear();

    const department = s(head[7]);
    const data = {
      department,
      company: department,
      note:
        groupRows.length > 1
          ? `${s(groupRows[0][4]) || "Vật tư"} và ${groupRows.length - 1} mặt hàng khác`
          : s(groupRows[0][4]),
      proposalCode,
      senderName: s(head[1]),
      receivedDate,
      requiredTime: s(head[8]),
      deliveryPlan: s(head[9]),
      priorityLevel: head[10] ? parseInt(head[10], 10) || undefined : undefined,
      purchaseStaff: s(head[11]),
      lastUpdated: parseVNDate(s(head[12]), fallbackYear),
      supplierName: s(head[13]),
      poNumber: s(head[14]),
      orderStatus: s(head[15]),
      accountingMaterial: s(head[16]),
      taxStatus: s(head[17]),
      accountingPayment: s(head[18]),
      paymentStatus: s(head[19]),
      receivedStatus: s(head[20]),
      warehouseConfirm: s(head[21]),
      surplusShortage: s(head[22]),
    };

    const existing = await prisma.purchaseRequest.findFirst({ where: { proposalCode } });

    let prId: string;
    if (existing) {
      await prisma.purchaseRequest.update({ where: { id: existing.id }, data });
      prId = existing.id;
      updated++;
    } else {
      const code = `SYNC-${proposalCode}`.slice(0, 190);
      const pr = await prisma.purchaseRequest.create({
        data: {
          ...data,
          code,
          status: "APPROVED",
          requesterId: admin.id,
        },
      });
      prId = pr.id;
      created++;
    }

    // Replace items with the latest snapshot from the sheet
    await prisma.purchaseRequestItem.deleteMany({ where: { purchaseRequestId: prId } });
    const items = groupRows
      .map((r) => ({
        name: s(r[4]),
        unit: s(r[5]) || "Cái",
        quantity: parseFloat((r[6] || "0").replace(",", ".")) || 0,
      }))
      .filter((it) => it.name);

    if (items.length > 0) {
      await prisma.purchaseRequestItem.createMany({
        data: items.map((it) => ({
          purchaseRequestId: prId,
          name: it.name!,
          unit: it.unit,
          quantity: it.quantity,
        })),
      });
      totalItems += items.length;
    }
  }

  return { totalProposals: groups.size, created, updated, totalItems };
}
