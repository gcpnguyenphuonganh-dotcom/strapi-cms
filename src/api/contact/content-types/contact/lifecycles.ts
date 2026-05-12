// src/api/contact/content-types/contact/lifecycles.ts

const sentEmails = new Set<number>();

export default {
  async afterCreate(event) {
    const { result } = event;

    // Chỉ gửi khi publish
    if (!result.publishedAt) {
      console.log(`Bỏ qua draft contact id=${result.id}`);
      return;
    }

    console.log(
      'afterCreate contact fired:',
      result.id,
      '| Set:',
      [...sentEmails]
    );

    // Chặn duplicate
    if (sentEmails.has(result.id)) {
      console.log(`DUPLICATE BLOCKED contact id=${result.id}`);
      return;
    }

    sentEmails.add(result.id);

    // Xóa khỏi set sau 10s
    setTimeout(() => {
      sentEmails.delete(result.id);
    }, 10_000);

    try {
      // Lấy dữ liệu contact
      const entry = await strapi.db
        .query('api::contact.contact')
        .findOne({
          where: { id: result.id },
        });

      // Gửi mail
      await strapi.plugins['email'].services.email.send({
  to: 'anh.np13092004@gmail.com',
  from: 'webcty@gmail.com',
  subject: `[Liên hệ] ${entry?.name}${entry?.company ? ` — ${entry.company}` : ''}`,
  html: `
    <div style="max-width:560px;margin:0 auto;padding:48px 24px;font-family:'Segoe UI',Arial,sans-serif;color:#1a1a1a;font-size:15px;line-height:1.8;">

      <p>Kính gửi, phòng sale</p>

      <p>Hệ thống vừa nhận được một yêu cầu liên hệ mới với thông tin như sau:</p>

      <p>
        <strong>Họ và tên:</strong> ${entry?.name || ''}<br/>
        <strong>Công ty:</strong> ${entry?.company || ''}<br/>
        <strong>Email:</strong> ${entry?.email || ''}<br/>
        <strong>Số điện thoại:</strong> ${entry?.phone || ''}<br/>
        <strong>Tiêu đề:</strong> ${entry?.subject || ''}<br/>
        <strong>Sản phẩm quan tâm:</strong> ${entry?.product || ''}
      </p>

      <p><strong>Nội dung yêu cầu:</strong></p>
      <p style="white-space:pre-line;color:#374151;">${entry?.requirements || ''}</p>

      <p>
        Trân trọng đề nghị quý bộ phận liên hệ lại với khách hàng trong thời gian sớm nhất.
      </p>

      <p>Trân trọng,<br/>Hệ thống liên hệ</p>

    </div>
  `,
});

      console.log(
        'Gửi mail contact thành công id=',
        result.id
      );
    } catch (err) {
      console.error('Lỗi lifecycle contact:', err);

      sentEmails.delete(result.id);
    }
  },
};