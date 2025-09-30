import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { nome, telefone, email } = await req.json();

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": process.env.BREVO_API_KEY as string,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "Estety Cloud", email: "estetycloud@gmail.com" },
        to: [{ email: "estetycloud@gmail.com" }],
        subject: "Novo Consultor",
        htmlContent: `
          <h2>📋 Novo pedido de Consultor</h2>
          <p><b>Nome:</b> ${nome}</p>
          <p><b>Telefone:</b> ${telefone}</p>
          <p><b>Email:</b> ${email}</p>
        `,
        textContent: "Novo pedido de consultor recebido no Estety Cloud.",
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("❌ Erro da API Brevo:", err);
      return NextResponse.json({ success: false, error: err }, { status: 500 });
    }

    const data = await response.json();
    console.log("📧 Email enviado via Brevo:", data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Erro inesperado:", error);
    return NextResponse.json({ success: false, error: "Erro inesperado" }, { status: 500 });
  }
}
