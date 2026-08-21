import { getPrismaClient } from "./prisma";

const DEFAULT_KHR_RATE = 0.0002439;

function toUSD(totalAmount: number | null | undefined, currency: string | null | undefined, exchangeRate: number | null | undefined) {
  const amount = totalAmount || 0;
  if (currency === "USD") return amount;
  if (currency === "KHR") return amount * (exchangeRate || DEFAULT_KHR_RATE);
  return amount;
}

export const assistantTools = [
  {
    name: "search_orders",
    description:
      "Tìm kiếm đơn đặt hàng (purchase orders) theo công ty, nhà cung cấp, hoặc từ khóa trong diễn giải. Trả về tối đa 15 kết quả gần nhất.",
    input_schema: {
      type: "object" as const,
      properties: {
        company: { type: "string", description: "Mã công ty, VD: ERC, BP, SV" },
        supplierName: { type: "string", description: "Tên nhà cung cấp (tìm gần đúng)" },
        keyword: { type: "string", description: "Từ khóa trong diễn giải đơn hàng" },
        limit: { type: "number", description: "Số kết quả tối đa, mặc định 15" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "search_requests",
    description:
      "Tìm kiếm phiếu đề xuất mua hàng theo công ty, người gửi, tình trạng, hoặc từ khóa nội dung. Trả về tối đa 15 kết quả gần nhất.",
    input_schema: {
      type: "object" as const,
      properties: {
        company: { type: "string", description: "Mã công ty, VD: ERC, BP, SV" },
        senderName: { type: "string", description: "Tên người gửi đề xuất" },
        orderStatus: { type: "string", description: "Tình trạng, VD: Hoàn thành, Thanh Toán, KT kiểm tra, Chưa lên đơn hàng" },
        keyword: { type: "string", description: "Từ khóa trong nội dung đề xuất" },
        limit: { type: "number", description: "Số kết quả tối đa, mặc định 15" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_summary_stats",
    description:
      "Lấy số liệu tổng hợp toàn hệ thống: tổng giá trị đơn hàng quy đổi USD, chi tiêu theo từng công ty, số lượng đơn hàng/đề xuất, và phân bổ trạng thái đề xuất. Dùng khi người dùng hỏi câu tổng quan như 'tổng chi tiêu', 'công ty nào chi nhiều nhất', 'bao nhiêu đơn hàng đang chờ'.",
    input_schema: {
      type: "object" as const,
      properties: {},
      additionalProperties: false,
    },
  },
  {
    name: "search_contracts",
    description: "Tìm hợp đồng đã ký theo công ty hoặc tên nhà cung cấp.",
    input_schema: {
      type: "object" as const,
      properties: {
        company: { type: "string", description: "Mã công ty, VD: ERC, BP, SV" },
        supplierName: { type: "string", description: "Tên nhà cung cấp" },
      },
      additionalProperties: false,
    },
  },
];

export async function executeAssistantTool(name: string, input: any): Promise<string> {
  const prisma = getPrismaClient();

  try {
    switch (name) {
      case "search_orders": {
        const where: any = {};
        if (input.company) where.company = input.company;
        if (input.supplierName) where.supplier = { name: { contains: input.supplierName, mode: "insensitive" } };
        if (input.keyword) where.note = { contains: input.keyword, mode: "insensitive" };

        const orders = await prisma.purchaseOrder.findMany({
          where,
          include: { supplier: true },
          orderBy: { orderDate: "desc" },
          take: Math.min(input.limit || 15, 30),
        });

        return JSON.stringify(
          orders.map((o: any) => ({
            code: o.code,
            date: o.orderDate,
            supplier: o.supplier.name,
            company: o.company,
            totalAmount: o.totalAmount,
            currency: o.currency,
            status: o.status,
            note: o.note,
          }))
        );
      }

      case "search_requests": {
        const where: any = {};
        if (input.company) where.company = input.company;
        if (input.senderName) where.senderName = { contains: input.senderName, mode: "insensitive" };
        if (input.orderStatus) where.orderStatus = { contains: input.orderStatus, mode: "insensitive" };
        if (input.keyword) where.note = { contains: input.keyword, mode: "insensitive" };

        const requests = await prisma.purchaseRequest.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: Math.min(input.limit || 15, 30),
        });

        return JSON.stringify(
          requests.map((r: any) => ({
            code: r.proposalCode || r.code,
            sender: r.senderName,
            company: r.company,
            department: r.department,
            content: r.note,
            orderStatus: r.orderStatus,
            supplierName: r.supplierName,
            poNumber: r.poNumber,
            receivedDate: r.receivedDate,
          }))
        );
      }

      case "get_summary_stats": {
        const [orders, requests] = await Promise.all([
          prisma.purchaseOrder.findMany({ select: { company: true, totalAmount: true, currency: true, exchangeRate: true } }),
          prisma.purchaseRequest.findMany({ select: { orderStatus: true, status: true } }),
        ]);

        const totalUSD = orders.reduce((sum: number, o: any) => sum + toUSD(o.totalAmount, o.currency, o.exchangeRate), 0);

        const byCompany: Record<string, number> = {};
        orders.forEach((o: any) => {
          const c = o.company || "Không rõ";
          byCompany[c] = (byCompany[c] || 0) + toUSD(o.totalAmount, o.currency, o.exchangeRate);
        });

        const byStatus: Record<string, number> = {};
        requests.forEach((r: any) => {
          const s = r.orderStatus || r.status;
          byStatus[s] = (byStatus[s] || 0) + 1;
        });

        return JSON.stringify({
          totalOrders: orders.length,
          totalRequests: requests.length,
          totalUSDEquivalent: Math.round(totalUSD),
          spendByCompanyUSD: Object.fromEntries(
            Object.entries(byCompany).map(([k, v]) => [k, Math.round(v)])
          ),
          requestStatusBreakdown: byStatus,
        });
      }

      case "search_contracts": {
        const where: any = {};
        if (input.company) where.company = input.company;
        if (input.supplierName) where.supplier = { name: { contains: input.supplierName, mode: "insensitive" } };

        const contracts = await prisma.contract.findMany({
          where,
          include: { supplier: true },
          orderBy: { createdAt: "desc" },
          take: 20,
        });

        return JSON.stringify(
          contracts.map((c: any) => ({
            code: c.code,
            supplier: c.supplier.name,
            company: c.company,
            fileName: c.fileName,
            fileUrl: c.fileUrl,
          }))
        );
      }

      default:
        return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
  } catch (e: any) {
    return JSON.stringify({ error: e?.message || "Tool execution failed" });
  }
}
