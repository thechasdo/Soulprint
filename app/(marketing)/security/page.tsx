import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LockKeyhole, ShieldCheck, Search, UserCog } from "lucide-react";

const items = [
  {
    icon: ShieldCheck,
    title: "Database-level protection",
    text: "Every user-data table is designed for Supabase Row Level Security. The frontend never gets to decide who owns data."
  },
  {
    icon: UserCog,
    title: "Locked roles",
    text: "Users cannot update their own plan, storage limit, billing status, family role, or privilege level from the client."
  },
  {
    icon: Search,
    title: "Indexed uploads",
    text: "Files move through a pending indexing queue so names, tags, extracted text, OCR, and transcripts can become searchable."
  },
  {
    icon: LockKeyhole,
    title: "Private storage",
    text: "Memory files are stored privately. Public pages should use controlled signed URLs or approved public display records."
  }
];

export default function SecurityPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-5 py-16">
        <div className="max-w-3xl">
          <p className="font-black uppercase tracking-[0.25em] text-seafoam">Trust & Security</p>
          <h1 className="mt-4 text-5xl font-black tracking-tight text-navy">People trust Soulprint with irreplaceable memories.</h1>
          <p className="mt-5 text-lg leading-8 text-navy/70">
            The platform is designed around secure roles, private storage, audit logs, feature flags, and long-term exportability.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.title} className="brand-card rounded-brand p-7">
              <item.icon className="h-10 w-10 text-sunset" />
              <h2 className="mt-5 text-2xl font-black text-navy">{item.title}</h2>
              <p className="mt-3 leading-7 text-navy/70">{item.text}</p>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
