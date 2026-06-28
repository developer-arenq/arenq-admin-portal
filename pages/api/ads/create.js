import fs from 'fs';
import path from 'path';
import main from '../../../database/conn';
import Ad from '../../../model/adSchema';
import User from '../../../model/userSchema';
import slugify from 'slugify';
import nodemailer from 'nodemailer';

const saveBase64Image = (base64, filename) => {
  const matches = base64.match(/^data:(image\/.+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid base64 image');

  const ext = matches[1].split('/')[1];
  const buffer = Buffer.from(matches[2], 'base64');
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileName = `${filename}-${Date.now()}.${ext}`;
  const filePath = path.join(uploadsDir, fileName);
  fs.writeFileSync(filePath, buffer);

  return `${process.env.HOST}/uploads/${fileName}`;
};

const CreateAd = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  await main().catch(err => console.error('DB connection error:', err));

  try {
    const users = await User.find({});
    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }

    const {
      name,
      description,
      price,
      MRP,
      alt_text,
      image,
      subject,
      heading,
      product_link,
    } = req.body;

    const imageUrl = image
      ? saveBase64Image(image, slugify(name))
      : null;

    const adObj = {
      name,
      slug: slugify(name),
      owner: 'Admin',
      email: 'info@arenq.co.in',
      description,
      price,
      MRP,
      alt_text,
      imageUrl,
      subject,
      heading,
      product_link,
    };

    const newAd = await Ad.create(adObj);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });

    const attachments = [];
    let imageCid = null;

    if (imageUrl) {
      const filename = path.basename(imageUrl);
      const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

      imageCid = 'adimage@arenq';

      attachments.push({
        filename,
        path: filePath,
        cid: imageCid,
      });
    }

    for (const user of users) {
      const mailOptions = {
        from: `"Arenq" <${process.env.EMAIL_FROM}>`,
        to: user.email,
        subject: subject,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
            <div style="background:#f7f7f7;padding:20px;text-align:center;">
              <h2 style="margin:0;">${heading}</h2>
            </div>
            <div style="padding:20px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="width: 40%; vertical-align: top; text-align: center;">
                    ${imageCid
                      ? `<img src="cid:${imageCid}" alt="${alt_text}" style="width:100%; max-width:200px; height:auto; object-fit:cover; border-radius:5px;" />`
                      : ''
                    }
                  </td>
                  <td style="width: 60%; padding-left: 20px; vertical-align: top;">
                    <h3 style="margin-top:0;color:#333;">${name}</h3>
                    <p style="color:#777;">${description || 'NA'}</p>
                    <p style="font-size:18px;margin:10px 0;">
                      <span style="color:green;font-weight:bold;">₹${price}</span>
                      <span style="text-decoration:line-through;color:#999;margin-left:10px;">₹${MRP}</span>
                    </p>
                    <a href="${product_link}" style="display:inline-block;margin-top:15px;padding:10px 20px;background:#16A34A;color:white;text-decoration:none;border-radius:5px;">Shop Now</a>
                  </td>
                </tr>
              </table>
            </div>
            <div style="background:#f1f1f1;padding:15px;text-align:center;font-size:12px;color:#666;">
              You're receiving this because you're subscribed to our product updates.
            </div>
          </div>
        `,
        attachments,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${user.email}`);
      } catch (emailErr) {
        console.error(`Failed to send email to ${user.email}:`, emailErr);
      }
    }

    return res.status(201).json({
      message: 'Ad created and emails sent to all users.',
      imageUrl,
    });

  } catch (err) {
    console.error('Ad create error:', err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
};

export default CreateAd;
