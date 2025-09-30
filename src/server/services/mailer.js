import SibApiV3Sdk from "sib-api-v3-sdk";

const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

export async function sendMail(to, subject, html) {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.sender = {
      name: "Estety Cloud",
      email: "estetycloud@gmail.com" // precisa estar configurado no Brevo
    };
    sendSmtpEmail.to = [{ email: to }];
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html;
    sendSmtpEmail.textContent = "Seu agendamento foi confirmado no Estety Cloud.";

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("📧 Email enviado via Brevo:", data);
    return true;
  } catch (error) {
    console.error("❌ Erro ao enviar e-mail via Brevo:", error.response?.text || error.message);
    return false;
  }
}
