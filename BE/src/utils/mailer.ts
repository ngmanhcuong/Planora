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
  item: { title: string; kind: 'Công việc' | 'Lịch trình'; scheduledAt: Date; isOverdue?: boolean }
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
  const detailUrl = escapeHtml(`${config.clientUrl.replace(/\/$/, '')}${item.kind === 'Công việc' ? '/tasks' : '/calendar'}`);
  const accent = item.isOverdue ? '#e11d48' : '#4f46e5';

  await transporter.sendMail({
    from: mailConfig.from,
    to,
    subject: `${headline}: ${item.title}`,
    text: `${headline}: “${item.title}” vào ${fullTime}. Mở Planora: ${detailUrl}`,
    html: `
      <div style="margin:0;padding:0;background:#f5f6f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#172033;-webkit-font-smoothing:antialiased;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f5f6f8;">
          <tr>
            <td align="center" style="padding:32px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;border-collapse:separate;background:#ffffff;border:1px solid #dde2ea;border-top:4px solid ${accent};border-radius:10px;overflow:hidden;">
                <tr>
                  <td style="padding:21px 28px;border-bottom:1px solid #e8ebf0;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                      <tr>
                        <td style="vertical-align:middle;"><img src="${EMAIL_LOGO_URL}" width="132" alt="Planora" style="display:block;width:132px;max-width:132px;height:auto;border:0;" /></td>
                        <td align="right" style="font-size:12px;line-height:1.4;font-weight:500;color:#7b8496;">Thông báo lịch trình</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:30px 28px 28px;">
                    <p style="margin:0 0 8px;color:${accent};font-size:13px;line-height:1.5;font-weight:600;letter-spacing:.1px;">${safeHeadline}</p>
                    <h1 style="margin:0 0 12px;font-size:25px;line-height:1.3;font-weight:750;letter-spacing:-.45px;color:#172033;">${safeTitle}</h1>
                    <p style="margin:0 0 25px;color:#5d687b;font-size:15px;line-height:1.65;font-weight:400;">${item.isOverdue ? 'Thời hạn của công việc này đã qua. Bạn có thể mở Planora để cập nhật lại tiến độ.' : 'Công việc này sắp đến hạn. Bạn nên kiểm tra lại kế hoạch để hoàn thành đúng thời gian.'}</p>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:26px;background:#f8f9fb;border:1px solid #e3e7ed;border-radius:8px;">
                      <tr>
                        <td style="padding:15px 18px;color:#697386;font-size:13px;line-height:1.5;font-weight:500;border-bottom:1px solid #e3e7ed;">Ngày</td>
                        <td align="right" style="padding:15px 18px;color:#20293a;font-size:14px;line-height:1.5;font-weight:650;border-bottom:1px solid #e3e7ed;text-transform:capitalize;">${date}</td>
                      </tr>
                      <tr>
                        <td style="padding:15px 18px;color:#697386;font-size:13px;line-height:1.5;font-weight:500;">Thời gian</td>
                        <td align="right" style="padding:15px 18px;color:#20293a;font-size:14px;line-height:1.5;font-weight:650;font-variant-numeric:tabular-nums;">${time}</td>
                      </tr>
                    </table>

                    <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                      <tr>
                        <td align="center" style="border-radius:7px;background:#4f46e5;">
                          <a href="${detailUrl}" target="_blank" style="display:inline-block;padding:11px 18px;color:#ffffff;text-decoration:none;font-size:14px;line-height:1.4;font-weight:650;letter-spacing:-.05px;">Xem trong Planora</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:17px 28px;background:#fafbfc;border-top:1px solid #e8ebf0;color:#7c8698;font-size:12px;line-height:1.6;font-weight:400;">Email được gửi theo thiết lập thông báo của bạn trên Planora. Đây là thư tự động, vui lòng không trả lời.</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
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
