import nodemailer from 'nodemailer';
import { config } from '../config';

const getMailerConfig = () => {
  const { host, port, user, pass, from } = config.smtp;

  if (!host || !port || !user || !pass || !from) {
    throw new Error('Chưa cấu hình SMTP để gửi OTP thật');
  }

  return { host, port, user, pass, from };
};

export const sendPasswordResetOtpEmail = async (to: string, otp: string): Promise<void> => {
  const mailConfig = getMailerConfig();

  const transporter = nodemailer.createTransport({
    host: mailConfig.host,
    port: mailConfig.port,
    secure: config.smtp.secure,
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 12000,
    auth: {
      user: mailConfig.user,
      pass: mailConfig.pass,
    },
  });

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
                        <td style="vertical-align:middle;">
                          <table role="presentation" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                            <tr>
                              <td style="width:36px;height:36px;border-radius:10px;background:#4f46e5;color:#ffffff;font-size:18px;font-weight:800;text-align:center;vertical-align:middle;">
                                P
                              </td>
                              <td style="padding-left:10px;font-size:20px;font-weight:800;letter-spacing:-.3px;color:#111827;vertical-align:middle;">
                                Planora
                              </td>
                            </tr>
                          </table>
                        </td>
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
