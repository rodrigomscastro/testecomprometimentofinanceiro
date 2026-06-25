import { withAuth } from "next-auth/middleware";

// Protege o painel (/admin/*) e as APIs de administração (/api/events/*).
// A própria página de login e a API pública /api/submit permanecem livres.
export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const { pathname } = req.nextUrl;
      if (pathname.startsWith("/admin/login")) return true;
      return !!token;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
});

export const config = {
  matcher: ["/admin/:path*", "/api/events/:path*"],
};
