export default ({ env }: { env: any }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // Dùng SSL cho cổng 465
        auth: {
          user: 'anh.np13092004@gmail.com',
          pass: 'jzccxmfvidpxuatl', // Viết liền, không dấu cách
        },
      },
      settings: {
        defaultFrom: 'anh.np13092004@gmail.com',
        defaultReplyTo: 'anh.np13092004@gmail.com',
      },
    },
  },
});