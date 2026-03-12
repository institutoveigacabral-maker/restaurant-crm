const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f4f4f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #ea580c; padding: 24px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .content { padding: 32px 24px; }
    .footer { padding: 16px 24px; text-align: center; color: #71717a; font-size: 12px; border-top: 1px solid #e4e4e7; }
    .button { display: inline-block; background: #ea580c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; }
    h2 { color: #18181b; margin-top: 0; }
    p { color: #3f3f46; line-height: 1.6; }
    .detail { background: #f4f4f5; padding: 16px; border-radius: 8px; margin: 16px 0; }
    .detail p { margin: 4px 0; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>RestaurantCRM</h1></div>
    <div class="content">${content}</div>
    <div class="footer">
      <p>RestaurantCRM — Sistema de gestão para restaurantes</p>
    </div>
  </div>
</body>
</html>`;

export function reservationConfirmationEmail(data: {
  customerName: string;
  date: string;
  time: string;
  guests: number;
  table: string;
}) {
  return baseTemplate(`
    <h2>Reserva Confirmada!</h2>
    <p>Olá ${data.customerName},</p>
    <p>Sua reserva foi confirmada com sucesso.</p>
    <div class="detail">
      <p><strong>Data:</strong> ${data.date}</p>
      <p><strong>Horário:</strong> ${data.time}</p>
      <p><strong>Pessoas:</strong> ${data.guests}</p>
      <p><strong>Mesa:</strong> ${data.table}</p>
    </div>
    <p>Estamos esperando por você!</p>
  `);
}

export function reservationReminderEmail(data: {
  customerName: string;
  date: string;
  time: string;
  guests: number;
}) {
  return baseTemplate(`
    <h2>Lembrete de Reserva</h2>
    <p>Olá ${data.customerName},</p>
    <p>Este é um lembrete da sua reserva para amanhã.</p>
    <div class="detail">
      <p><strong>Data:</strong> ${data.date}</p>
      <p><strong>Horário:</strong> ${data.time}</p>
      <p><strong>Pessoas:</strong> ${data.guests}</p>
    </div>
    <p>Caso precise cancelar ou alterar, entre em contato conosco.</p>
  `);
}

export function orderConfirmationEmail(data: {
  customerName: string;
  orderId: string;
  items: { name: string; quantity: number; price: number }[];
  total: number;
}) {
  const itemsHtml = data.items
    .map(
      (i) =>
        `<p>${i.quantity}x ${i.name} — R$ ${(i.price * i.quantity).toFixed(2).replace(".", ",")}</p>`
    )
    .join("");

  return baseTemplate(`
    <h2>Pedido Confirmado!</h2>
    <p>Olá ${data.customerName},</p>
    <p>Seu pedido #${data.orderId} foi recebido.</p>
    <div class="detail">
      ${itemsHtml}
      <p style="margin-top: 12px; font-size: 16px;"><strong>Total: R$ ${data.total.toFixed(2).replace(".", ",")}</strong></p>
    </div>
  `);
}

export function welcomeEmail(data: { customerName: string }) {
  return baseTemplate(`
    <h2>Bem-vindo!</h2>
    <p>Olá ${data.customerName},</p>
    <p>Obrigado por se cadastrar em nosso restaurante. Estamos felizes em tê-lo como cliente!</p>
    <p>Com nosso sistema, você pode:</p>
    <ul style="color: #3f3f46;">
      <li>Fazer reservas facilmente</li>
      <li>Acompanhar seus pedidos</li>
      <li>Acumular benefícios de fidelidade</li>
    </ul>
    <p style="text-align: center; margin-top: 24px;">
      <a href="${process.env.AUTH_URL || "http://localhost:3000"}" class="button">Acessar Sistema</a>
    </p>
  `);
}

export function churnAlertEmail(data: {
  customerName: string;
  lastVisit: string;
  daysSince: number;
}) {
  return baseTemplate(`
    <h2>Sentimos sua falta!</h2>
    <p>Olá ${data.customerName},</p>
    <p>Faz ${data.daysSince} dias desde sua última visita em ${data.lastVisit}.</p>
    <p>Gostaríamos de convidá-lo para nos visitar novamente. Temos novidades no cardápio!</p>
    <p style="text-align: center; margin-top: 24px;">
      <a href="${process.env.AUTH_URL || "http://localhost:3000"}" class="button">Fazer Reserva</a>
    </p>
  `);
}
