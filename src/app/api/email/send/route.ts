import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import {
  reservationConfirmationEmail,
  reservationReminderEmail,
  orderConfirmationEmail,
  welcomeEmail,
  churnAlertEmail,
} from "@/lib/email-templates";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";

type TemplateData = Record<
  string,
  string | number | { name: string; quantity: number; price: number }[]
>;

const TEMPLATE_CONFIG: Record<string, { subject: string; render: (data: TemplateData) => string }> =
  {
    reservation_confirmation: {
      subject: "Reserva Confirmada",
      render: (data) =>
        reservationConfirmationEmail({
          customerName: data.customerName as string,
          date: data.date as string,
          time: data.time as string,
          guests: data.guests as number,
          table: data.table as string,
        }),
    },
    reservation_reminder: {
      subject: "Lembrete de Reserva",
      render: (data) =>
        reservationReminderEmail({
          customerName: data.customerName as string,
          date: data.date as string,
          time: data.time as string,
          guests: data.guests as number,
        }),
    },
    order_confirmation: {
      subject: "Pedido Confirmado",
      render: (data) =>
        orderConfirmationEmail({
          customerName: data.customerName as string,
          orderId: data.orderId as string,
          items: data.items as { name: string; quantity: number; price: number }[],
          total: data.total as number,
        }),
    },
    welcome: {
      subject: "Bem-vindo ao RestaurantCRM",
      render: (data) =>
        welcomeEmail({
          customerName: data.customerName as string,
        }),
    },
    churn_alert: {
      subject: "Sentimos sua falta!",
      render: (data) =>
        churnAlertEmail({
          customerName: data.customerName as string,
          lastVisit: data.lastVisit as string,
          daysSince: data.daysSince as number,
        }),
    },
  };

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return errorResponse("Não autorizado", 401);

    const user = session.user as { role?: string };
    if (user.role !== "admin") return errorResponse("Acesso restrito a administradores", 403);

    const body = await req.json();
    const { template, to, data } = body as {
      template: string;
      to: string;
      data: TemplateData;
    };

    if (!template || !to || !data) {
      return errorResponse("Campos obrigatórios: template, to, data", 422);
    }

    const config = TEMPLATE_CONFIG[template];
    if (!config) {
      return errorResponse(
        `Template inválido. Opções: ${Object.keys(TEMPLATE_CONFIG).join(", ")}`,
        422
      );
    }

    const html = config.render(data);
    const result = await sendEmail({ to, subject: config.subject, html });

    return successResponse(result, 200);
  } catch (error) {
    return handleApiError(error);
  }
}
