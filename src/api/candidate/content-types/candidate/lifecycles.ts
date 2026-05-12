import fs from 'fs';
import path from 'path';

const sentEmails = new Set<number>();

export default {
  async afterCreate(event) {
    const { result } = event;

    //  Chỉ gửi khi publishedAt có giá trị (tức là published, không phải draft)
    if (!result.publishedAt) {
      console.log(` Bỏ qua draft entry id=${result.id}`);
      return;
    }

    console.log(' afterCreate fired, id:', result.id, '| Set hiện tại:', [...sentEmails]);

    if (sentEmails.has(result.id)) {
      console.log(` DUPLICATE BLOCKED id=${result.id}`);
      return;
    }

    sentEmails.add(result.id);
    setTimeout(() => sentEmails.delete(result.id), 10_000);

    console.log(' Bắt đầu gửi mail cho id:', result.id);

    try {
      const entry = await strapi.db.query('api::candidate.candidate').findOne({
        where: { id: result.id },
        populate: { CV: true },
      });

      let attachments = [];

      if (entry?.CV?.url) {
        const filePath = path.join(strapi.dirs.static.public, entry.CV.url);

        if (fs.existsSync(filePath)) {
          const fileBuffer = fs.readFileSync(filePath);
          attachments = [
            {
              filename: entry.CV.name,
              content: fileBuffer,
              contentType: 'application/pdf',
            },
          ];
        }
      }

      await strapi.plugins['email'].services.email.send({
  to: 'anh.np13092004@gmail.com',
  from: 'webcty@gmail.com',
  subject: `[Ứng tuyển] ${entry?.name}`,
  html: `
    <div style="max-width:560px;margin:0 auto;padding:48px 24px;font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;font-size:15px;line-height:1.8;">

      <p>Kính gửi Ban Tuyển dụng,</p>

      <p>
        Hệ thống vừa tiếp nhận một hồ sơ ứng tuyển mới với thông tin như sau:
      </p>

      <p>
        <strong>Họ và tên:</strong> ${entry?.name}<br/>
        <strong>Email:</strong> ${entry?.email}<br/>
        <strong>Số điện thoại:</strong> ${entry?.phone}
      </p>

      <p>
        Hồ sơ của ứng viên đã được đính kèm theo email này. Trân trọng đề nghị
        quý bộ phận xem xét và phản hồi trong thời gian sớm nhất.
      </p>

      <p>Trân trọng,<br/>Hệ thống tuyển dụng</p>

    </div>
  `,
  attachments,
});

      console.log(' Gửi mail thành công cho id:', result.id);
    } catch (err) {
      console.error(' Lỗi Lifecycle:', err);
      sentEmails.delete(result.id);
    }
  },
};