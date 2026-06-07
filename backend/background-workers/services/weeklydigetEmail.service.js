import getTransporter from "../utils/gettansporter.util.js";
import { formPublicLink } from "../utils/getWeeklyDigestContent.util.js";

async function sendWeeklyDigestEmail(email, letters) {
    const transporter = await getTransporter();

    const html = `
                    <div style="background:#0f172a;padding:40px 20px;font-family:Arial,Helvetica,sans-serif;color:#e2e8f0;">
                      <div style="max-width:700px;margin:auto;background:#111827;border:1px solid #1e293b;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.3);">

                        <!-- Header -->
                        <div style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:32px;text-align:center;">
                          <img
                            src="https://iconape.com/wp-content/files/kd/291769/png/expo-logo.png"
                            alt="RTEX Expo"
                            width="70"
                            style="margin-bottom:12px;"
                          />

                          <h1 style="margin:0;color:white;font-size:28px;">
                            Weekly RTEX Expo Digest
                          </h1>

                          <p style="margin-top:10px;color:#dbeafe;font-size:15px;">
                            Discover the most popular workspaces shared this week.
                          </p>
                        </div>

                        <!-- Body -->
                        <div style="padding:32px;">
                          <p style="margin-top:0;color:#cbd5e1;font-size:15px;">
                            Hello <strong>${email}</strong>,
                          </p>
                          <p style="color:#94a3b8;line-height:1.7;margin-bottom:28px;">
                            Here are this week's featured workspaces from the RTEX Expo community.
                          </p>

                          ${letters.map(letter => `
                            <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:18px;">
                              <h3 style="margin:0 0 10px 0;color:#f8fafc;">
                                ${letter.title}
                              </h3>
                              <p style="color:#cbd5e1;line-height:1.6;margin-bottom:16px;">
                                ${letter.preview}
                              </p>
                              <a
                                href="${formPublicLink(letter.publicId)}"
                                target="_blank"
                                style="display:inline-block;background:#2563eb;color:white;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">
                                View Workspace →
                              </a>
                            </div>
                          `).join("")}
                          <!-- CTA -->
                          <div style="margin-top:30px;text-align:center;background:#172554;border:1px solid #1d4ed8;border-radius:12px;padding:24px;">
                            <h3 style="color:white;margin-top:0;">
                              Explore More on RTEX Expo
                            </h3>
                            <p style="color:#cbd5e1;margin-bottom:16px;">
                              Discover new workspaces, collaborate, and stay updated with the community.
                            </p>
                            <a
                              href="https://rtex-expo.vercel.app/"
                              style="display:inline-block;background:#3b82f6;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;"
                            >
                              Visit RTEX Expo
                            </a>
                          </div>
                        </div>

                        <!-- Footer -->
                        <div style="border-top:1px solid #1e293b;padding:24px;text-align:center;background:#0f172a;">

                          <img
                            src="https://iconape.com/wp-content/files/kd/291769/png/expo-logo.png"
                            alt="RTEX Expo"
                            width="50"
                            style="margin-bottom:10px;"
                          />
                          <p style="color:#94a3b8;font-size:13px;margin:0;">
                            Thank you for being part of the RTEX Expo community.
                          </p>
                          <p style="color:#64748b;font-size:12px;margin-top:12px;">
                            © ${new Date().getFullYear()} RTEX Expo. All rights reserved.
                          </p>

                          <p style="color:#64748b;font-size:11px;margin-top:8px;">
                            You are receiving this email because you subscribed to RTEX Expo updates.
                          </p>
                        </div>
                      </div>
                    </div>
                  `;

    const info = await transporter.sendMail({
        from: `"RTEX Expo" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "RTEX Expo Weekly Digest",
        html,
    });
    console.log("Email sent:", info.messageId);
}

export { sendWeeklyDigestEmail };


// TODO: Add unsubscribe link in the future when we have that feature implemented
        // <div style="font-size:12px; color:#888; margin-top:16px;">
        //   You are receiving this email because you subscribed to RTEX Expo updates. If you wish to unsubscribe, please click <a href="https://rtex.vercel.app/unsubscribe?email=${encodeURIComponent(email)}">here</a>.
        // </div>