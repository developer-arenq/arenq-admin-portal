import fs from 'fs';
import path from 'path';
import main from '../../../database/conn';
import Ad from '../../../model/posterAd';
import User from '../../../model/userSchema';
import slugify from 'slugify';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Save base64 image to server and return its URL
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

// Send WhatsApp message via Twilio
const sendWhatsAppMessage = async (to, body, mediaUrl = null) => {
    try {
        const messageOptions = {
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${to}`,
            body,
        };

        if (mediaUrl) {
            messageOptions.mediaUrl = [mediaUrl];
        }

        const message = await twilioClient.messages.create(messageOptions);
        console.log(`WhatsApp message sent to ${to}: SID=${message.sid}`);
    } catch (error) {
        console.error(`Failed to send WhatsApp message to ${to}:`, error.message);
    }
};

// API handler
const CreateAd = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    await main().catch(err => {
        console.error('DB connection error:', err);
        return res.status(500).json({ error: 'Database connection failed' });
    });

    try {
        const users = await User.find({});
        if (!users || users.length === 0) {
            return res.status(404).json({ error: 'No users found' });
        }

        const { subject, heading, image } = req.body;

        if (!subject || !heading || !image) {
            return res.status(400).json({
                error: 'Subject, heading, image are required',
            });
        }

        let imageUrl;
        try {
            imageUrl = saveBase64Image(image, slugify(subject));
        } catch (imgErr) {
            console.error('Image processing error:', imgErr.message);
            return res.status(400).json({ error: 'Invalid base64 image format' });
        }

        // Save Ad to DB
        await Ad.create({
            owner: 'Admin',
            email: 'admin@apneehatti.com',
            imageUrl,
            subject,
            heading,
        });

        // Email transporter setup
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

            imageCid = 'adimage@apneehatti';
            attachments.push({
                filename,
                path: filePath,
                cid: imageCid,
            });
        }

        // Loop through users
        for (const user of users) {
            const name = user.fullname || 'there';

            // Email
            const mailOptions = {
                from: `"Arenq" <${process.env.EMAIL_FROM}>`,
                to: "kiran@apneehatti.com", //user.email "kiran@apneehatti.com"
                subject,
                html: `
                    <div style="font-family:Arial,sans-serif;max-width:900px;margin:auto;border:1px solid #ddd;border-radius:8px;overflow:hidden;">
                        <div style="background:#f7f7f7;padding:20px;text-align:center;">
                            <h2 style="margin:0;">Hey ${name},</h2>
                            <h3 style="margin-top:10px;">${heading}</h3>
                        </div>
                        <div style="padding:20px;text-align:center;">
                            ${imageCid ? `<img src="cid:${imageCid}" alt="Ad image" style="width:100%;max-width:700px;height:auto;border-radius:5px;" />` : ''}
                        </div>
                        <div style="padding:20px;text-align:center;">
                            <a href="https://www.facebook.com/Apneehatti-103048901780149" style="margin:0 10px;text-decoration:none;color:#3b5998;">Facebook</a>
                            <a href="https://www.instagram.com/apneehatti_official" style="margin:0 10px;text-decoration:none;color:#e1306c;">Instagram</a>
                            <a href="https://x.com/ApneeHatti" style="margin:0 10px;text-decoration:none;color:#1da1f2;">Twitter</a>
                            <br /><br />
                            <a href="https://www.arenq.co.in/shop" style="text-decoration:none;color:#000;">Visit Shop</a> |
                            <a href="https://www.arenq.co.in/contact-us" style="text-decoration:none;color:#000;">Contact Us</a> |
                            <a href="https://www.arenq.co.in/bulk-order" style="text-decoration:none;color:#000;">Bulk Orders</a>
                        </div>
                        <div style="background:#f1f1f1;padding:15px;text-align:center;font-size:12px;color:#666;">
                            You're receiving this because you're subscribed to our updates.   
                        </div>
                    </div>
                `,
                attachments,
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`Email sent to ${user.email}`);
            } catch (emailErr) {
                console.error(`Failed to send email to ${user.email}:`, emailErr.message);
            }

            // WhatsApp
            if (user.phone) {
                const messageBody = `Hey ${name},\n\n${heading}`;
                await sendWhatsAppMessage(user.phone, messageBody, imageUrl);
            }
        }

        return res.status(201).json({
            message: 'Ad created and notifications sent via email and WhatsApp.',
            imageUrl,
        });

    } catch (err) {
        console.error('Ad creation/send error:', err.message);
        return res.status(500).json({ error: 'Something went wrong' });
    }
};

export default CreateAd;
