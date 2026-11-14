import { Resend } from "resend";
import {
  PlannerConfirmationEmailProps,
  renderBookingConfirmationPlannerEmail,
} from "./templates/booking-confirmation-planner";
import {
  OwnerLeadAlertEmailProps,
  renderNewLeadAlertOwnerEmail,
} from "./templates/new-lead-alert-owner";
import {
  BookingStatusUpdateEmailProps,
  renderBookingStatusUpdateEmail,
} from "./templates/booking-status-update";

const resendApiKey = process.env.RESEND_API_KEY?.trim();

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

const DEFAULT_FROM =
  process.env.EMAIL_FROM || "MG-Events Direct <onboarding@resend.dev>";

export async function sendNewBookingEmails(params: {
  plannerEmail: string;
  ownerEmail: string;
  plannerPayload: PlannerConfirmationEmailProps;
  ownerPayload: OwnerLeadAlertEmailProps;
}) {
  if (!resend) {
    console.info(
      "[Resend Skipped - No API Key] Would dispatch planner confirmation & owner lead alert for:",
      params.plannerPayload.bookingCode
    );
    return { sent: false };
  }

  const plannerMail = renderBookingConfirmationPlannerEmail(
    params.plannerPayload
  );
  const ownerMail = renderNewLeadAlertOwnerEmail(params.ownerPayload);

  try {
    await Promise.allSettled([
      resend.emails.send({
        from: DEFAULT_FROM,
        to: [params.plannerEmail],
        subject: plannerMail.subject,
        html: plannerMail.html,
      }),
      resend.emails.send({
        from: DEFAULT_FROM,
        to: [params.ownerEmail],
        subject: ownerMail.subject,
        html: ownerMail.html,
      }),
    ]);
    return { sent: true };
  } catch (err) {
    console.error("[Resend Error] Failed to dispatch booking emails:", err);
    return { sent: false, error: err };
  }
}

export async function sendBookingStatusUpdateEmail(params: {
  plannerEmail: string;
  payload: BookingStatusUpdateEmailProps;
}) {
  if (!resend) {
    console.info(
      "[Resend Skipped - No API Key] Would dispatch status update for:",
      params.payload.bookingCode
    );
    return { sent: false };
  }

  const mail = renderBookingStatusUpdateEmail(params.payload);

  try {
    await resend.emails.send({
      from: DEFAULT_FROM,
      to: [params.plannerEmail],
      subject: mail.subject,
      html: mail.html,
    });
    return { sent: true };
  } catch (err) {
    console.error("[Resend Error] Failed to send status update email:", err);
    return { sent: false, error: err };
  }
}
