export interface OwnerLeadAlertEmailProps {
  bookingCode: string;
  ownerName: string;
  listingTitle: string;
  plannerName: string;
  plannerEmail: string;
  plannerPhone: string;
  eventDate: string;
  eventType: string;
  guestCount: number;
  packageName: string;
  totalAmount: number;
  plannerNotes?: string | null;
}

export function renderNewLeadAlertOwnerEmail(
  props: OwnerLeadAlertEmailProps
): { subject: string; html: string } {
  const formattedTotal = "$" + Number(props.totalAmount).toLocaleString("en-US");
  const dashboardUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/dashboard/owner`;

  return {
    subject: `New Direct Booking Lead (${props.bookingCode}) · ${props.eventDate} at ${props.listingTitle}`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>New Direct Booking Lead · MG-Events</title>
</head>
<body style="margin:0;padding:32px;background:#ffffff;color:#0a0a0a;font-family:Inter,system-ui,-apple-system,sans-serif;line-height:1.6;">
  <div style="max-width:600px;margin:0 auto;border:1px solid #0a0a0a;padding:32px;">
    <div style="border-bottom:1px solid #d1d5db;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;">
      <span style="font-family:Georgia,serif;font-size:24px;">MG—Events</span>
      <span style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;">100% Owner Payout</span>
    </div>

    <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;margin:0 0 8px;">Direct Lead Alert · #${props.bookingCode}</p>
    <h1 style="font-family:Georgia,serif;font-weight:400;font-size:32px;line-height:1.05;margin:0 0 16px;">
      ${props.plannerName} requested ${props.eventDate}.
    </h1>

    <table style="width:100%;border-collapse:collapse;border-top:1px solid #0a0a0a;border-bottom:1px solid #0a0a0a;margin-bottom:20px;font-size:14px;">
      <tr>
        <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #d1d5db;">Listing</td>
        <td style="padding:10px 0;text-align:right;font-weight:500;border-bottom:1px solid #d1d5db;">${props.listingTitle}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #d1d5db;">Planner Name</td>
        <td style="padding:10px 0;text-align:right;border-bottom:1px solid #d1d5db;">${props.plannerName}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #d1d5db;">Direct Contact</td>
        <td style="padding:10px 0;text-align:right;border-bottom:1px solid #d1d5db;">${props.plannerEmail} · ${props.plannerPhone}</td>
      </tr>
      <tr>
        <td style="padding:10px 0;color:#6b7280;border-bottom:1px solid #d1d5db;">Event &amp; Guests</td>
        <td style="padding:10px 0;text-align:right;border-bottom:1px solid #d1d5db;">${props.eventType} · ${props.guestCount} guests (${props.packageName})</td>
      </tr>
      <tr>
        <td style="padding:14px 0;font-weight:600;">Your Net Payout (0% Fee)</td>
        <td style="padding:14px 0;text-align:right;font-family:Georgia,serif;font-size:24px;">${formattedTotal}</td>
      </tr>
    </table>

    ${
      props.plannerNotes
        ? `<div style="background:#f3f4f6;padding:14px;margin-bottom:24px;font-size:13px;border-left:2px solid #0a0a0a;">
            <strong>Planner Note:</strong> “${props.plannerNotes}”
          </div>`
        : ""
    }

    <a href="${dashboardUrl}" style="display:inline-block;padding:11px 20px;border:1px solid #0a0a0a;background:#0a0a0a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:500;">
      Confirm or Manage in Owner Portal
    </a>
  </div>
</body>
</html>`,
  };
}
