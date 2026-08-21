import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { requireAuth } from "@/lib/auth";
import { assistantTools, executeAssistantTool } from "@/lib/assistantTools";

const SYSTEM_PROMPT = `Bạn là trợ lý AI của hệ thống QLMH (Quản lý mua hàng) cho KLH Snuol.
Nhiệm vụ: giúp người dùng tra cứu đơn hàng, đề xuất mua hàng, hợp đồng, và tổng hợp số liệu chi tiêu.
Luôn trả lời bằng tiếng Việt, ngắn gọn, dùng bảng hoặc gạch đầu dòng khi liệt kê nhiều mục.
Khi không chắc công ty/nhà cung cấp người dùng hỏi, hãy tìm kiếm rộng trước rồi thu hẹp dựa trên kết quả.
Nếu không tìm thấy dữ liệu phù hợp, nói rõ là không tìm thấy thay vì bịa thông tin.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Trợ lý AI chưa được cấu hình (thiếu GEMINI_API_KEY)" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const chatMessages: ChatMessage[] = body.messages || [];

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-3.6-flash",
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ functionDeclarations: assistantTools }],
    });

    // Everything except the last user message becomes prior history.
    const history = chatMessages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const lastMessage = chatMessages[chatMessages.length - 1]?.content || "";

    const chat = model.startChat({ history });

    let result = await chat.sendMessage(lastMessage);
    let finalText = "";
    const MAX_ITERATIONS = 6;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const functionCalls = result.response.functionCalls();

      if (!functionCalls || functionCalls.length === 0) {
        finalText = result.response.text();
        break;
      }

      const functionResponses = await Promise.all(
        functionCalls.map(async (call) => ({
          functionResponse: {
            name: call.name,
            response: await executeAssistantTool(call.name, call.args),
          },
        }))
      );

      result = await chat.sendMessage(functionResponses);
    }

    return NextResponse.json({ reply: finalText || "Xin lỗi, tôi chưa tìm được câu trả lời phù hợp." });
  } catch (error: any) {
    console.error("Assistant error:", error);
    const message = error?.message || "";
    if (message.includes("API key") || message.includes("API_KEY")) {
      return NextResponse.json({ error: "API key không hợp lệ" }, { status: 500 });
    }
    if (message.includes("429") || message.toLowerCase().includes("quota")) {
      return NextResponse.json({ error: "Đang quá tải, vui lòng thử lại sau" }, { status: 429 });
    }
    return NextResponse.json({ error: "Lỗi xử lý trợ lý AI" }, { status: 500 });
  }
}
