import { getSession } from "@/lib/auth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LandingPage } from "@/components/home/LandingPage";

export default async function Home() {
  const session = await getSession();

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-[#00AEEF]/30 selection:text-white">
      <Navbar session={session} />
      <LandingPage />
      <Footer />
    </main>
  );
}
