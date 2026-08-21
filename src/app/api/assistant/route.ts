import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { requireAuth } from "@/lib/auth";
import { assistantTools, executeAssistantTool } from "@/lib/assistantTools";

const SYSTEM_PROMPT = `Bạn là trợ lý AI của hệ thống QLMH (Quản lý mua hàng) cho KLH Snuol.
Nhiệm vụ: giúp người dùng tra cứu đơn hàng, đề xuất mua hàng, hợp đồng, và tổng hợp số liệu chi tiêu.
Luôn trả lời bằng tiếng Việt, ngắn gọn, dùng bảng hoặc gạch đầu dòng khi liệt kê nhiều mục.
Khi không chắc công ty/nhà cung cấp người dùng hỏi, hãy tìm kiếm rộng trước rồi thu hẹp dựa trên kết quả.
Nếu không tìm thấy dữ liệu phù hợp, nói rõ là không tìm thấy thay vì bịa thông tin.`;

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Trợ lý AI chưa được cấu hình (thiếu ANTHROPIC_API_KEY)" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const userMessages: Anthropic.MessageParam[] = body.messages || [];

    const client = new Anthropic();
    const messages: Anthropic.MessageParam[] = [...userMessages];

    let finalText = "";
    const MAX_ITERATIONS = 6;

    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const response = await client.messages.create({
        model: "claude-opus-5",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        tools: assistantTools,
        messages,
      });

      if (response.stop_reason !== "tool_use") {
        const textBlock = response.content.find(
          (b): b is Anthropic.TextBlock => b.type === "text"
        );
        finalText = textBlock?.text || "";
        break;
      }

      messages.push({ role: "assistant", content: response.content });

      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === "tool_use"
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const tool of toolUseBlocks) {
        const result = await executeAssistantTool(tool.name, tool.input);
        toolResults.push({
          type: "tool_result",
          tool_use_id: tool.id,
          content: result,
        });
      }

      messages.push({ role: "user", content: toolResults });
    }

    return NextResponse.json({ reply: finalText || "Xin lỗi, tôi chưa tìm được câu trả lời phù hợp." });
  } catch (error: any) {
    if (error instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "API key không hợp lệ" }, { status: 500 });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Đang quá tải, vui lòng thử lại sau" }, { status: 429 });
    }
    console.error("Assistant error:", error);
    return NextResponse.json({ error: "Lỗi xử lý trợ lý AI" }, { status: 500 });
  }
}
