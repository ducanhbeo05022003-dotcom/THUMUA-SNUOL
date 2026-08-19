import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.stockMovement.deleteMany();
  await prisma.stockItem.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.purchaseRequestItem.deleteMany();
  await prisma.purchaseRequest.deleteMany();
  await prisma.material.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create sample users
  const adminPwd = await bcrypt.hash("admin123", 10);
  const userPwd = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.create({
    data: {
      username: "admin",
      name: "Admin User",
      passwordHash: adminPwd,
      role: "ADMIN",
    },
  });

  const purchaser = await prisma.user.create({
    data: {
      username: "purchaser",
      name: "Nhân viên mua hàng",
      passwordHash: userPwd,
      role: "PURCHASER",
    },
  });

  const approver = await prisma.user.create({
    data: {
      username: "approver",
      name: "Người duyệt",
      passwordHash: userPwd,
      role: "APPROVER",
    },
  });

  // Create sample suppliers
  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        code: "SUP001",
        name: "Công ty Phân bón Việt",
        taxCode: "0123456789",
        contactName: "Nguyễn Văn A",
        phone: "0901234567",
        email: "contact@phanbon.com",
        address: "Hà Nội",
      },
    }),
    prisma.supplier.create({
      data: {
        code: "SUP002",
        name: "Công ty Hạt giống Quốc tế",
        taxCode: "0987654321",
        contactName: "Trần Thị B",
        phone: "0912345678",
        email: "info@hatgiong.com",
        address: "TP HCM",
      },
    }),
  ]);

  // Create sample materials
  const materials = await Promise.all([
    prisma.material.create({
      data: {
        name: "Phân bò hoai",
        unit: "Kg",
        category: "Phân bón",
        stage: "Trồng mới",
        techSpec: "Hữu cơ ≥20%, C/N≤12",
        norm: 10,
        normUnit: "Kg/cây",
      },
    }),
    prisma.material.create({
      data: {
        name: "Túi bầu",
        unit: "Cái",
        category: "Vật tư",
        stage: "Trồng mới",
        techSpec: "Kích cỡ chuẩn",
        norm: 1,
        normUnit: "Cái/cây",
      },
    }),
    prisma.material.create({
      data: {
        name: "Xơ dừa",
        unit: "M3",
        category: "Vật tư",
        stage: "Trồng mới",
        techSpec: "Xơ dừa tươi",
        norm: 0.02,
        normUnit: "M3/cây",
      },
    }),
  ]);

  // Create stock items
  await Promise.all(
    materials.map((material) =>
      prisma.stockItem.create({
        data: {
          materialId: material.id,
          quantity: 1000,
        },
      })
    )
  );

  console.log("✓ Admin:", admin.username);
  console.log("✓ Purchaser:", purchaser.username);
  console.log("✓ Approver:", approver.username);
  console.log("✓ Suppliers:", suppliers.length);
  console.log("✓ Materials:", materials.length);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("\n✓ Seed completed");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
