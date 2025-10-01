# Recipe Manager

A full-stack recipe management app built with [Next.js](https://nextjs.org), Prisma, and TypeScript. Easily create, edit, organize, and search your recipes.

---

## 🚀 Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn
   # or
   pnpm install
   # or
   bun install
   ```

2. **Set up your environment variables:**

   - **Google OAuth credentials are required for login.** You must provide `GOOGLE_ID` and `GOOGLE_SECRET` in your `.env` file. You can obtain these from the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   - **A NextAuth secret is also required.** Set `NEXTAUTH_SECRET` in your `.env` file to a long, random string (you can generate one with `openssl rand -base64 32`).

3. **Set up the database:**

   ```bash
   npx prisma migrate dev
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📝 Features

- User authentication
- Create, edit, and delete recipes
- Add ingredients, steps, notes, and tags
- Upload recipe images
- Search and filter recipes
- Responsive UI with [Tailwind CSS](https://tailwindcss.com/)
- Data stored with [Prisma ORM](https://www.prisma.io/)

---

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Icons](https://react-icons.github.io/react-icons/)
- [Netlify](https://www.netlify.com/) (for deployment)

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

## 🚀 Deployment

Deploy your app instantly on [Netlify](https://app.netlify.com/start).

---

## 🔮 Future Updates

I plan to update the app with more features as I have time. Stay tuned for improvements and new functionality!

---

## 📄 License

No License

---
