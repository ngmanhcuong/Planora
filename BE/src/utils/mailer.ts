import nodemailer from 'nodemailer';
import { config } from '../config';

const EMAIL_LOGO_URL = process.env.EMAIL_LOGO_URL
  || 'https://raw.githubusercontent.com/ngmanhcuong/Planora/427c4f78703f9a858e9eaef2cce7675cf6f08492/FE/public/planora-logo-professional.png';

const getMailerConfig = () => {
  const { host, port, user, pass, from } = config.smtp;

  if (!host || !port || !user || !pass || !from) {
    throw new Error('Chưa cấu hình SMTP để gửi OTP thật');
  }

  return { host, port, user, pass, from };
};

const createTransporter = () => {
  const mailConfig = getMailerConfig();
  return {
    mailConfig,
    transporter: nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: config.smtp.secure,
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 12000,
      auth: { user: mailConfig.user, pass: mailConfig.pass },
    }),
  };
};

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#039;',
}[character] || character));

const NON_DELIVERABLE_EMAIL_DOMAINS = new Set([
  'example.com',
  'example.net',
  'example.org',
  'localhost',
  'test',
  'invalid',
]);

export const isDeliverableEmailAddress = (email: string): boolean => {
  const normalizedEmail = email.trim().toLowerCase();
  const separatorIndex = normalizedEmail.lastIndexOf('@');
  if (separatorIndex <= 0 || separatorIndex === normalizedEmail.length - 1) return false;

  const domain = normalizedEmail.slice(separatorIndex + 1);
  return !NON_DELIVERABLE_EMAIL_DOMAINS.has(domain) && !domain.endsWith('.invalid');
};

export const sendScheduleReminderEmail = async (
  to: string,
  item: { title: string; kind: 'Công việc' | 'Lịch trình' | 'Thời khóa biểu'; scheduledAt: Date; isOverdue?: boolean }
): Promise<void> => {
  const { mailConfig, transporter } = createTransporter();
  const date = item.scheduledAt.toLocaleDateString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const time = item.scheduledAt.toLocaleTimeString('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    hour: '2-digit',
    minute: '2-digit',
  });
  const fullTime = `${time}, ${date}`;
  const headline = item.isOverdue ? `${item.kind} đã quá hạn` : `${item.kind} sắp tới`;
  const safeTitle = escapeHtml(item.title);
  const safeHeadline = escapeHtml(headline);
  const detailPath = item.kind === 'Công việc'
    ? '/tasks'
    : item.kind === 'Thời khóa biểu'
      ? '/timetable'
      : '/calendar';
  const detailUrl = escapeHtml(`${config.clientUrl.replace(/\/$/, '')}${detailPath}`);
  const accentColor = item.isOverdue ? '#e11d48' : '#4f46e5';
  const badgeBg = item.isOverdue ? '#ffe4e6' : '#e0e7ff';
  const badgeTextColor = item.isOverdue ? '#9f1239' : '#3730a3';
  const iconEmoji = item.isOverdue ? '⚠️' : item.kind === 'Thời khóa biểu' ? '📚' : item.kind === 'Công việc' ? '📌' : '🗓️';

  await transporter.sendMail({
    from: mailConfig.from,
    to,
    subject: `${item.isOverdue ? '⚠️ ' : '🔔 '}${headline}: ${item.title}`,
    text: `${headline}: “${item.title}” vào ${fullTime}. Xem chi tiết trong Planora: ${detailUrl}`,
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${safeHeadline}: ${safeTitle}</title>
        <style>
          @media (prefers-color-scheme: dark) {
            .email-bg { background-color: #0b0f19 !important; }
            .card-bg { background-color: #111827 !important; border-color: #1f2937 !important; }
            .header-border { border-bottom-color: #1f2937 !important; }
            .main-title { color: #f9fafb !important; }
            .sub-desc { color: #9ca3af !important; }
            .info-box { background-color: #1a2234 !important; border-color: #27354f !important; }
            .info-label { color: #94a3b8 !important; }
            .info-val { color: #f1f5f9 !important; }
            .footer-bg { background-color: #0f172a !important; border-top-color: #1e293b !important; color: #64748b !important; }
            .tag-pill { background-color: #1e293b !important; color: #cbd5e1 !important; border-color: #334155 !important; }
          }
        </style>
      </head>
      <body style="margin:0;padding:0;background-color:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-bg" style="border-collapse:collapse;background-color:#f4f6fb;padding:32px 12px;">
          <tr>
            <td align="center" style="padding:28px 12px;">
              <!-- Container Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="card-bg" style="max-width:540px;border-collapse:separate;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:20px;overflow:hidden;box-shadow:0 10px 25px -5px rgba(15,23,42,0.06), 0 8px 10px -6px rgba(15,23,42,0.04);">
                
                <!-- Top Brand Banner with Gradient Accent -->
                <tr>
                  <td style="height:5px;background:linear-gradient(90deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%);padding:0;line-height:5px;font-size:5px;">&nbsp;</td>
                </tr>

                <!-- Header / Logo -->
                <tr>
                  <td class="header-border" style="padding:22px 28px;border-bottom:1px solid #f1f5f9;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="vertical-align:middle;">
                          <img src="${EMAIL_LOGO_URL}" width="128" alt="Planora" style="display:block;width:128px;max-width:128px;height:auto;border:0;" />
                        </td>
                        <td align="right" style="vertical-align:middle;">
                          <span class="tag-pill" style="display:inline-block;padding:5px 12px;border-radius:9999px;font-size:11px;line-height:1;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;background-color:#f1f5f9;color:#475569;border:1px solid #e2e8f0;">
                            ${escapeHtml(item.kind)}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Body Content -->
                <tr>
                  <td style="padding:32px 28px 24px;">
                    <!-- Kind / Status badge -->
                    <div style="margin:0 0 12px 0;">
                      <span style="display:inline-flex;align-items:center;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:700;line-height:1.2;background-color:${badgeBg};color:${badgeTextColor};">
                        ${iconEmoji}&nbsp;${safeHeadline}
                      </span>
                    </div>

                    <!-- Event Title -->
                    <h1 class="main-title" style="margin:0 0 12px 0;font-size:24px;line-height:1.35;font-weight:800;letter-spacing:-0.4px;color:#0f172a;">
                      ${safeTitle}
                    </h1>

                    <!-- Message description -->
                    <p class="sub-desc" style="margin:0 0 24px 0;color:#64748b;font-size:14px;line-height:1.6;font-weight:400;">
                      ${item.isOverdue ? 'Thời hạn hoàn thành mục này đã trôi qua. Hãy mở Planora để rà soát hoặc điều chỉnh lại tiến độ.' : `Lịch trình này sắp bắt đầu theo kế hoạch đã đặt. Vui lòng kiểm tra lại để sắp xếp thời gian hợp lý.`}
                    </p>

                    <!-- Info Box (Date, Time) -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="info-box" style="border-collapse:collapse;margin:0 0 26px 0;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;">
                      <tr>
                        <td class="info-label" style="padding:14px 18px;color:#64748b;font-size:13px;line-height:1.4;font-weight:600;border-bottom:1px solid #edf2f7;width:40%;">
                          🗓️&nbsp;&nbsp;Ngày diễn ra
                        </td>
                        <td align="right" class="info-val" style="padding:14px 18px;color:#0f172a;font-size:13.5px;line-height:1.4;font-weight:700;border-bottom:1px solid #edf2f7;">
                          ${date}
                        </td>
                      </tr>
                      <tr>
                        <td class="info-label" style="padding:14px 18px;color:#64748b;font-size:13px;line-height:1.4;font-weight:600;">
                          ⏰&nbsp;&nbsp;Thời gian
                        </td>
                        <td align="right" class="info-val" style="padding:14px 18px;color:#0f172a;font-size:14px;line-height:1.4;font-weight:800;font-variant-numeric:tabular-nums;">
                          ${time}
                        </td>
                      </tr>
                    </table>

                    <!-- Primary Action Button -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                      <tr>
                        <td align="center">
                          <a href="${detailUrl}" target="_blank" style="display:inline-block;width:100%;box-sizing:border-box;text-align:center;padding:13px 24px;border-radius:12px;background:linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);color:#ffffff;text-decoration:none;font-size:14px;line-height:1.4;font-weight:700;letter-spacing:-0.1px;box-shadow:0 4px 12px rgba(79,70,229,0.3);">
                            Xem chi tiết trong Planora &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td class="footer-bg" style="padding:18px 28px;background-color:#faf8ff;border-top:1px solid #f1f5f9;color:#8590a2;font-size:12px;line-height:1.6;font-weight:400;text-align:center;">
                    Email này được gửi tự động từ <strong>Planora</strong> theo cài đặt nhắc nhở của bạn.<br />
                    Vui lòng không phản hồi thư này.
                  </td>
                </tr>
              </table>

              <!-- Bottom copyright / branding -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:540px;margin-top:16px;">
                <tr>
                  <td align="center" style="font-size:11px;color:#94a3b8;line-height:1.5;">
                    &copy; ${new Date().getFullYear()} Planora &bull; Trợ lý quản lý thời gian &amp; lịch trình học tập
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });
};

export const sendPasswordResetOtpEmail = async (to: string, otp: string): Promise<void> => {
  const { mailConfig, transporter } = createTransporter();

  await transporter.sendMail({
    from: mailConfig.from,
    to,
    subject: 'Mã OTP đặt lại mật khẩu Planora',
    text: `Mã OTP đặt lại mật khẩu Planora của bạn là ${otp}. Mã có hiệu lực trong 10 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.`,
    html: `
      <div style="margin:0;padding:0;background:#f4f6fb;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;color:#111827;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f4f6fb;padding:32px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;border-collapse:collapse;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
                <tr>
                  <td style="padding:28px 32px 22px;border-bottom:1px solid #eef2f7;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="vertical-align:middle;"><img src="${EMAIL_LOGO_URL}" width="132" alt="Planora" style="display:block;width:132px;max-width:132px;height:auto;border:0;" /></td>
                        <td align="right" style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.8px;vertical-align:middle;">
                          Bảo mật tài khoản
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;font-weight:800;letter-spacing:-.4px;color:#111827;">
                      Mã xác minh đặt lại mật khẩu
                    </h1>
                    <p style="margin:0;color:#475569;font-size:15px;line-height:1.7;">
                      Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Planora của bạn. Dùng mã dưới đây để tiếp tục.
                    </p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:26px 0;">
                      <tr>
                        <td align="center" style="padding:24px 18px;border-radius:14px;background:#f8fafc;border:1px solid #e2e8f0;">
                          <div style="font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:1.4px;margin-bottom:10px;">
                            Mã OTP
                          </div>
                          <div style="font-size:36px;line-height:1.2;font-weight:800;letter-spacing:10px;color:#111827;font-family:'Courier New',Courier,monospace;">
                            ${otp}
                          </div>
                        </td>
                      </tr>
                    </table>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin:0 0 22px;">
                      <tr>
                        <td style="padding:14px 16px;border-radius:12px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;font-size:14px;line-height:1.6;">
                          Mã này có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này cho bất kỳ ai, kể cả người tự xưng là nhân viên hỗ trợ.
                        </td>
                      </tr>
                    </table>

                    <p style="margin:0;color:#64748b;font-size:13px;line-height:1.7;">
                      Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Mật khẩu hiện tại của bạn sẽ không bị thay đổi.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 32px;background:#f8fafc;border-top:1px solid #eef2f7;color:#94a3b8;font-size:12px;line-height:1.6;">
                    Email này được gửi tự động từ Planora. Vui lòng không trả lời email này.
                  </td>
                </tr>
              </table>
              <div style="max-width:560px;margin:14px auto 0;text-align:center;color:#94a3b8;font-size:12px;line-height:1.6;">
                © 2026 Planora
              </div>
            </td>
          </tr>
        </table>
      </div>
    `,
  });
};

export const sendLoginOtpEmail = async (to: string, otp: string): Promise<void> => {
  const { mailConfig, transporter } = createTransporter();
  await transporter.sendMail({
    from: mailConfig.from,
    to,
    subject: 'Mã xác thực đăng nhập Planora',
    text: `Mã xác thực đăng nhập Planora của bạn là ${otp}. Mã có hiệu lực trong 10 phút.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:32px;color:#172033"><img src="${EMAIL_LOGO_URL}" width="132" alt="Planora"><h2>Xác thực đăng nhập</h2><p>Dùng mã sau để hoàn tất đăng nhập. Mã có hiệu lực trong 10 phút.</p><div style="font-size:34px;font-weight:800;letter-spacing:8px;background:#f1f5f9;padding:20px;text-align:center;border-radius:12px">${otp}</div><p style="color:#64748b">Nếu bạn không thực hiện đăng nhập này, hãy đổi mật khẩu ngay.</p></div>`,
  });
};

export const sendLoginAlertEmail = async (
  to: string,
  details: { ip?: string; userAgent?: string; loggedInAt: Date }
): Promise<void> => {
  const { mailConfig, transporter } = createTransporter();
  const time = details.loggedInAt.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  await transporter.sendMail({
    from: mailConfig.from,
    to,
    subject: 'Cảnh báo đăng nhập tài khoản Planora',
    text: `Tài khoản của bạn vừa đăng nhập lúc ${time}. IP: ${details.ip || 'Không xác định'}. Thiết bị: ${details.userAgent || 'Không xác định'}.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#172033"><img src="${EMAIL_LOGO_URL}" width="132" alt="Planora"><h2>Phát hiện lượt đăng nhập mới</h2><p>Tài khoản Planora của bạn vừa được đăng nhập.</p><table style="width:100%;background:#f8fafc;padding:16px;border-radius:10px"><tr><td>Thời gian</td><td><b>${escapeHtml(time)}</b></td></tr><tr><td>IP</td><td><b>${escapeHtml(details.ip || 'Không xác định')}</b></td></tr><tr><td>Thiết bị</td><td><b>${escapeHtml(details.userAgent || 'Không xác định')}</b></td></tr></table><p>Nếu đây không phải bạn, hãy đổi mật khẩu ngay.</p></div>`,
  });
};
