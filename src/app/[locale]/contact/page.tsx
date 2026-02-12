import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import ContactForm from "@/components/ContactForm";
import { Mail, Phone, MapPin, Globe } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Contact Us",
    description: "Get in touch with ALMSTKSHF for advanced media and legal solutions.",
};

export default function ContactPage() {
    const t = useTranslations("Contact");

    return (
        <main className="min-h-screen pt-32 pb-20">
            <Container>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    {/* Info Side */}
                    <div className="space-y-12">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-bold text-white tracking-tight">
                                {t("title")}
                            </h1>
                            <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                                {t("subtitle")}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-8">
                            {[
                                { icon: Mail, label: "Email", value: "info@almstkshf.com", color: "text-blue-400" },
                                { icon: Phone, label: "Phone", value: "+971 4 555 0123", color: "text-emerald-400" },
                                { icon: MapPin, label: "Address", value: "Dubai Research District, Building 42, UAE", color: "text-purple-400" },
                                { icon: Globe, label: "Region", value: "Middle East & North Africa", color: "text-cyan-400" },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-5 group">
                                    <div className={`w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center transition-all group-hover:border-slate-600 ${item.color}`}>
                                        <item.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</p>
                                        <p className="text-white font-medium">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Location Preview Placeholder */}
                        <div className="aspect-video w-full rounded-3xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-8 text-center gap-4 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent opacity-50"></div>
                            <MapPin className="w-8 h-8 text-slate-700 mb-2 group-hover:text-blue-500 transition-colors" />
                            <h4 className="text-slate-500 font-bold uppercase tracking-widest text-xs relative z-10">Dubai Headquarters</h4>
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 via-transparent to-purple-500/10 blur-3xl opacity-50"></div>
                        <div className="relative p-8 md:p-12 bg-slate-900/50 border border-slate-800 rounded-[40px] backdrop-blur-xl">
                            <ContactForm />
                        </div>
                    </div>
                </div>
            </Container>
        </main>
    );
}
