const nodemailer = require("nodemailer");

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  // 1. Check if standard SMTP environment variables exist
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true" || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    return transporter;
  }

  // 2. Check if Gmail service is configured
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
    return transporter;
  }

  // 3. Fallback: Automatic Ethereal Test Account for local development
  try {
    const testAccount = await nodemailer.createTestAccount();
    console.log("ℹ️ Created Ethereal test mailer account:", testAccount.user);
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return transporter;
  } catch (err) {
    console.warn("⚠️ Nodemailer test account creation skipped:", err.message);
    // JSON stream mock transporter
    transporter = nodemailer.createTransport({
      jsonTransport: true,
    });
    return transporter;
  }
};

// Base HTML Email Wrapper
const createEmailTemplate = ({ title, preheader, contentHtml, actionButton }) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px 12px; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
    .header { background: #09090b; padding: 24px 32px; color: #ffffff; }
    .logo { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff; text-decoration: none; }
    .logo span { color: #818cf8; }
    .body { padding: 32px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 16px; }
    .badge-urgent { background: #fee2e2; color: #b91c1c; }
    .badge-upcoming { background: #fef3c7; color: #b45309; }
    .badge-info { background: #e0e7ff; color: #4338ca; }
    .badge-success { background: #dcfce7; color: #15803d; }
    .task-box { background: #f8fafc; border-left: 4px solid #6366f1; border-radius: 8px; padding: 16px; margin: 20px 0; }
    .task-title { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; }
    .task-meta { font-size: 13px; color: #64748b; margin: 0; }
    .btn { display: inline-block; background: #09090b; color: #ffffff !important; font-weight: 600; font-size: 14px; text-decoration: none; padding: 12px 24px; border-radius: 10px; margin-top: 16px; }
    .footer { padding: 20px 32px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; text-align: center; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader || title}
  </div>
  <div class="card">
    <div class="header">
      <a href="http://localhost:3000/dashboard" class="logo">Task<span>Flow</span></a>
    </div>
    <div class="body">
      ${contentHtml}
      ${
        actionButton
          ? `<div style="text-align: center; margin-top: 24px;">
              <a href="${actionButton.url}" class="btn">${actionButton.text}</a>
            </div>`
          : ""
      }
    </div>
    <div class="footer">
      <p style="margin: 0 0 6px 0;">You received this email because of your notification preferences on TaskFlow.</p>
      <p style="margin: 0;">TaskFlow Inc. &bull; Smart Task Management & Real-time Collaboration</p>
    </div>
  </div>
</body>
</html>
  `;
};

// 1. Send Deadline Reminder Email
const sendDeadlineReminderEmail = async ({ to, username, task, isOverdue }) => {
  try {
    const transport = await getTransporter();
    const from = process.env.SMTP_FROM || `"TaskFlow Alerts" <notifications@taskflow.app>`;
    const dueDateFormatted = task.dueDate
      ? new Date(task.dueDate).toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        })
      : "Not specified";

    const badgeClass = isOverdue ? "badge-urgent" : "badge-upcoming";
    const badgeText = isOverdue ? "Task Overdue" : "Due Soon (24 Hours)";
    const subject = isOverdue
      ? `🚨 Overdue Task Alert: "${task.title}"`
      : `⏰ Deadline Reminder: "${task.title}" is due soon`;

    const contentHtml = `
      <span class="badge ${badgeClass}">${badgeText}</span>
      <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 12px 0;">Hello ${username || "there"},</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
        ${
          isOverdue
            ? `Your task <strong>"${task.title}"</strong> was scheduled for completion on <strong>${dueDateFormatted}</strong> and is currently overdue.`
            : `This is an automated reminder that your task <strong>"${task.title}"</strong> is due on <strong>${dueDateFormatted}</strong>.`
        }
      </p>

      <div class="task-box">
        <div class="task-title">${task.title}</div>
        <div class="task-meta">
          <strong>Priority:</strong> <span style="text-transform: capitalize;">${task.priority || "Medium"}</span> &bull; 
          <strong>Status:</strong> <span style="text-transform: capitalize;">${task.status || "Todo"}</span> &bull; 
          <strong>Due Date:</strong> ${dueDateFormatted}
        </div>
        ${task.description ? `<p style="font-size: 13px; color: #475569; margin: 10px 0 0 0;">${task.description}</p>` : ""}
      </div>

      <p style="color: #475569; font-size: 13px; line-height: 1.5; margin: 0;">
        Please review your task progress and mark it as completed once done.
      </p>
    `;

    const html = createEmailTemplate({
      title: subject,
      preheader: isOverdue ? `Task "${task.title}" is overdue` : `Task "${task.title}" is due soon`,
      contentHtml,
      actionButton: {
        text: "View Task in TaskFlow",
        url: "http://localhost:3000/dashboard/tasks",
      },
    });

    const info = await transport.sendMail({
      from,
      to,
      subject,
      html,
    });

    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`✉️ Email sent to ${to}. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("Failed to send deadline email:", err.message);
    return { success: false, error: err.message };
  }
};

// 2. Send Task Assigned / Shared Email
const sendTaskAssignedEmail = async ({ to, username, task, assignedBy, role }) => {
  try {
    const transport = await getTransporter();
    const from = process.env.SMTP_FROM || `"TaskFlow Team" <notifications@taskflow.app>`;
    const subject = `👥 ${assignedBy} shared a task with you: "${task.title}"`;

    const contentHtml = `
      <span class="badge badge-info">New Task Assignment</span>
      <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 12px 0;">Hello ${username || "there"},</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
        <strong>${assignedBy}</strong> has added you as a <strong>${role || "collaborator"}</strong> to the task below.
      </p>

      <div class="task-box">
        <div class="task-title">${task.title}</div>
        <div class="task-meta">
          <strong>Priority:</strong> <span style="text-transform: capitalize;">${task.priority || "Medium"}</span> &bull; 
          <strong>Role:</strong> <span style="text-transform: capitalize;">${role || "Editor"}</span>
        </div>
        ${task.description ? `<p style="font-size: 13px; color: #475569; margin: 10px 0 0 0;">${task.description}</p>` : ""}
      </div>
    `;

    const html = createEmailTemplate({
      title: subject,
      preheader: `${assignedBy} shared "${task.title}" with you on TaskFlow`,
      contentHtml,
      actionButton: {
        text: "Open Shared Task",
        url: "http://localhost:3000/dashboard/shared",
      },
    });

    const info = await transport.sendMail({
      from,
      to,
      subject,
      html,
    });

    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`✉️ Email sent to ${to}. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("Failed to send task assigned email:", err.message);
    return { success: false, error: err.message };
  }
};

// 3. Send New Comment Email
const sendNewCommentEmail = async ({ to, username, task, commentAuthor, commentText }) => {
  try {
    const transport = await getTransporter();
    const from = process.env.SMTP_FROM || `"TaskFlow Discussion" <notifications@taskflow.app>`;
    const subject = `💬 New comment on "${task.title}" from ${commentAuthor}`;

    const contentHtml = `
      <span class="badge badge-info">Discussion Update</span>
      <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 12px 0;">Hello ${username || "there"},</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
        <strong>${commentAuthor}</strong> added a new comment to <strong>"${task.title}"</strong>:
      </p>

      <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; margin: 16px 0; font-style: italic; color: #334155; font-size: 14px;">
        &ldquo;${commentText}&rdquo;
      </div>
    `;

    const html = createEmailTemplate({
      title: subject,
      preheader: `${commentAuthor} commented on "${task.title}"`,
      contentHtml,
      actionButton: {
        text: "Reply in TaskFlow",
        url: "http://localhost:3000/dashboard/tasks",
      },
    });

    const info = await transport.sendMail({
      from,
      to,
      subject,
      html,
    });

    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`✉️ Email sent to ${to}. Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("Failed to send comment email:", err.message);
    return { success: false, error: err.message };
  }
};

// 4. Send Test Notification Email
const sendTestNotificationEmail = async ({ to, username }) => {
  try {
    const transport = await getTransporter();
    const from = process.env.SMTP_FROM || `"TaskFlow System" <notifications@taskflow.app>`;
    const subject = `🧪 TaskFlow Email Notification Test`;

    const contentHtml = `
      <span class="badge badge-success">Email Service Active</span>
      <h2 style="font-size: 20px; font-weight: 800; margin: 0 0 12px 0;">Success!</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
        Hello <strong>${username || "TaskFlow User"}</strong>, your email notification channel is configured and operating properly.
      </p>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">
        You will now receive automatic email reminders for upcoming deadlines, overdue tasks, team assignments, and collaborative comment discussions based on your preferences.
      </p>
    `;

    const html = createEmailTemplate({
      title: subject,
      preheader: "Your TaskFlow email notifications are working!",
      contentHtml,
      actionButton: {
        text: "Go to Dashboard",
        url: "http://localhost:3000/dashboard",
      },
    });

    const info = await transport.sendMail({
      from,
      to,
      subject,
      html,
    });

    let previewUrl = null;
    if (nodemailer.getTestMessageUrl(info)) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`✉️ Test email sent to ${to}. Preview URL: ${previewUrl}`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (err) {
    console.error("Failed to send test email:", err.message);
    return { success: false, error: err.message };
  }
};

module.exports = {
  sendDeadlineReminderEmail,
  sendTaskAssignedEmail,
  sendNewCommentEmail,
  sendTestNotificationEmail,
};
