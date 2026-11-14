export interface BookingStatusUpdateEmailProps {
  bookingCode: string;
  plannerName: string;
  listingTitle: string;
  eventDate: string;
  newStatus: "CONFIRMED" | "DECLINED" | "CANCELLED" | "PENDING";
  totalAmount: number;
  ownerName: string;
  ownerResponseNote?: string | null;
}

export function renderBookingStatusUpdateEmail(
  props: BookingStatusUpdateEmailProps
): { subject: string; html: string } {
  const formattedTotal = "$" + Number(props.totalAmount).toLocaleString("en-US");
  const isConfirmed = props.newStatus === "CONFIRMED";

  return {
    subject: `Booking ${props.newStatus}: ${props.listingTitle} on ${props.eventDate} (#${props.bookingCode})`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Booking Status Update · MG-Events</title>
</head>
<body style="margin:0;padding:32px;background:#ffffff;color:#0a0a0a;font-family:Inter,system-ui,-apple-system,sans-serif;line-height:1.6;">
  <div style="max-width:600px;margin:0 auto;border:1px solid #0a0a0a;padding:32px;">
    <div style="border-bottom:1px solid #d1d5db;padding-bottom:16px;margin-bottom:24px;display:flex;justify-content:space-between;">
      <span style="font-family:Georgia,serif;font-size:24px;">MG—Events</span>
      <span style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;">Ref #${props.bookingCode}</span>
    </div>

    <p style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6b7280;margin:0 0 8px;">Status Update · ${props.newStatus}</p>
    <h1 style="font-family:Georgia,serif;font-weight:400;font-size:32px;line-height:1.05;margin:0 0 16px;">
      ${
        isConfirmed
          ? `${props.ownerName} confirmed your date (${props.eventDate}).`
          : `Update on your request for ${props.listingTitle} (${props.newStatus}).`
      }
    </h1>

    <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">
      ${
        isConfirmed
          ? `Your direct booking for ${props.listingTitle} on ${props.eventDate} (${formattedTotal}, 0% broker fee) is locked on the calendar.`
          : `The date (${props.eventDate}) at ${props.listingTitle} has been released back to the public calendar.`
      }
    </p>

    ${
      props.ownerResponseNote
        ? `<div style="background:#f3f4f6;padding:14px;margin-bottom:24px;font-size:13px;border-left:2px solid #0a0a0a;">
            <strong>Note from ${props.ownerName}:</strong> “${props.ownerResponseNote}”
          </div>`
        : ""
    }

    <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard/user" style="display:inline-block;padding:11px 20px;border:1px solid #0a0a0a;background:#0a0a0a;color:#ffffff;text-decoration:none;font-size:13px;font-weight:500;">
      View Booking in Planner Portal
    </a>
  </div>
</body>
</html>`,
  };
}
