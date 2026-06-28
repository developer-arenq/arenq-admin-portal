import main from '../../../database/conn';
import slugify from 'slugify';
import nodemailer from 'nodemailer';

const handler = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  await main().catch(err => console.error('DB connection error:', err));

  try {
    const { name, email, image, subject, heading, product_link } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });

    const attachments = [];
    let imageCid = null;

    if (image) {
      const matches = image.match(/^data:(image\/.+);base64,(.+)$/);
      if (matches) {
        const mimeType = matches[1]; // e.g., image/png
        const base64Data = matches[2];
        const extension = mimeType.split('/')[1];
        const filename = `${slugify(name)}.${extension}`;
        imageCid = 'reviewimage@arenq';

        attachments.push({
          filename,
          content: Buffer.from(base64Data, 'base64'),
          cid: imageCid,
          contentType: mimeType,
        });
      }
    }

    const mailOptions = {
      from: `"Arenq" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: subject,
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 700px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #f7f7f7; padding: 20px; text-align: center;">
        <h2 style="margin: 0; color: #333;">We’d love your feedback on <span style="color: #16A34A;">${name}</span></h2>
      </div>
      <div style="padding: 20px; display: flex; flex-direction: row; gap: 20px; align-items: center;">
        <div style="flex: 1; padding-left: 10px;">
          <p style="font-size: 16px; color: #555; margin: 0 0 10px;">
            Your opinion matters to us! Please take a moment to share your thoughts on <strong>${name}</strong>.
          </p>

          <div style="margin: 10px 0;">
            <span style="font-size: 25px; color: #ccc;">&#9734;</span>
            <span style="font-size: 25px; color: #ccc;">&#9734;</span>
            <span style="font-size: 25px; color: #ccc;">&#9734;</span>
            <span style="font-size: 25px; color: #ccc;">&#9734;</span>
            <span style="font-size: 25px; color: #ccc;">&#9734;</span>
          </div>

          <a href="${product_link}?openReview=true"
            style="display: inline-block; margin-top: 10px; padding: 12px 24px;
                    background-color: #16A34A; color: white; text-decoration: none;
                    border-radius: 4px; font-weight: bold;">
            Write a Review
          </a>
        </div>

        ${imageCid
          ? `<img src="cid:${imageCid}" alt="Review Image" style="width: 160px; height: auto; border-radius: 5px; border: 1px solid #ccc;" />`
          : ''
        }
      </div>

      <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 12px; color: #777;">
        Thank you for being a valued customer. This message was sent by Arenq.
      </div>
    </div>
        `,
      attachments,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);

    return res.status(200).json({ message: 'Review sent to given email.' });

  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export default handler;
