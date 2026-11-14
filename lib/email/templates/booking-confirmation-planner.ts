export interface PlannerConfirmationEmailProps {
  bookingCode: string;
  plannerName: string;
  listingTitle: string;
  listingCity: string;
  listingAddress: string;
  eventDate: string;
  eventType: string;
  guestCount: number;
  packageName: string;
  totalAmount: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
}

export function renderBookingConfirmationPlannerEmail(
  props: PlannerConfirmationEmailProps
): { subject: string; html: string } {
  const formattedTotal = "$" + Number(props.totalAmount).toLocaleString("en-US");
  const estimatedSavings =
    "$" + Math.round(props.totalAmount * 0.18).toLocaleString("en-US");

  return {
    subject: `Direct Booking Request ${props.bookingCode} · ${props.listingTitle}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Direct Booking Request · MG-Events</title>
</head>
<body style="margin:0;padding:32px;background:#ffffff;color:#0a0a0a;font-family:Inter,system-ui,-apple-system,sans-serif;line-height:1.6;">
  <div style="max-width:600px;margin:0 auto;border:1px solid #0a0a0a;padding:32px;">
    <div style="border-bottom:1px solid #d1d5db;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;">
      <span style="font-family:Georgia,serif;font-size:24px;">MG—Events</span>
      <span style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;">Ref #${props.bookingCode}</span>
    </div>

    <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;margin:0 0 8px;">Direct Booking · 0% Commission</p>
    <h1 style="font-family:Georgia,serif;font-weight:400;font-size:34px;line-height:1.05;margin:0 0 16px;">
      Your request is with ${props.ownerName}.
    </h1>
    <p style="color:#6b7280;font-size:15px;margin:0 0 24px;">
      Hi ${props.plannerName}, your date (${props.eventDate}) at <strong>${props.listingTitle}</strong> has been reserved on the live calendar while ${props.ownerName} confirms your direct agreement.
    </p>

    <table style="width:100%;border-collapse:collapse;border-top:1px solid #0a0a0a;border-bottom:1px solid #0a0a0a;margin-bottom:24px;font-size:14px;">
      <tr>
        <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #d1d5db;">Booking Reference</td>
        <td style="padding:10px 0;text-align:right;font-weight:500;border-bottom:1px solid #d1d5db;">${props.bookingCode}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #d1d5db;">Venue / Vendor</td>
        <td style="padding:10px 0;text-align:right;border-bottom:1px solid #d1d5db;">${props.listingTitle} (${props.listingCity})</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #d1d5db;">Event &amp; Date</td>
        <td style="padding:10px 0;text-align:right;border-bottom:1px solid #d1d5db;">${props.eventType} · ${props.eventDate}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #d1d5db;">Guests &amp; Package</td>
        <td style="padding:10px 0;text-align:right;border-bottom:1px solid #d1d5db;">${props.guestCount} guests · ${props.packageName}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #d1d5db;">Broker / Middleman Markup</td>
        <td style="padding:10px 0;text-align:right;font-weight:600;border-bottom:1px solid #d1d5db;">$0 (Saves ~${estimatedSavings})</td>
      </tr>
      <tr>
        <td style="padding:14px 0;font-weight:600;">Total Direct Owner Price</td>
        <td style="padding:14px 0;text-align:right;font-family:Georgia,serif;font-size:24px;">${formattedTotal}</td>
      </tr>
    </table>

    <div style="background:#f3f4f6;padding:16px;margin-bottom:24px;font-size:13px;">
      <strong style="display:block;text-transform:uppercase;letter-spacing:0.1em;font-size:11px;color:#6b7280;margin-bottom:4px;">Direct Owner Contact</strong>
      <div>${props.ownerName}</div>
      <div>Email: <a href="mailto:${props.ownerEmail}" style="color:#0a0a0a;">${props.ownerEmail}</a> · Phone: ${props.ownerPhone}</div>
      <div>Address: ${props.listingAddress}</div>
    </div>

    <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/user" style="display:inline-block;padding:11px 20px;border:1px solid #0a0a0a;background:#0a0a0a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:500;">
      Open Planner Dashboard
    </a>
  </div>
</body>
</html>`,
  };
}
