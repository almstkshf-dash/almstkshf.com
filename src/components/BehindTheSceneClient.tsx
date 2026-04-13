"use client";

import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import { motion } from "framer-motion";
import { Linkedin, Mail, ShieldCheck, Cpu, Award, GraduationCap } from "lucide-react";
import Image from "next/image";
import Button from "@/components/ui/Button";

export default function BehindTheSceneClient() {
    const t = useTranslations("Team");

    const members = [
        {
            key: "tamer",
            icon: Award,
            color: "text-primary",
            bg: "bg-primary/10",
            border: "border-primary/20",
            image: "/tamer.png"
        },
        {
            key: "rami",
            icon: ShieldCheck,
            color: "text-primary",
            bg: "bg-primary/10",
            border: "border-primary/20",
            image: "/rami.jpg"
        }
    ];

    return (
        <main className="min-h-screen pt-32 pb-20 bg-background text-foreground overflow-hidden">
            <Container>
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold uppercase tracking-widest"
                    >
                        <Award className="w-4 h-4" />
                        <span>{t("badge")}</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl lg:text-7xl font-bold tracking-tight"
                    >
                        {t("title")}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-muted-foreground font-light leading-relaxed"
                    >
                        {t("subtitle")}
                    </motion.p>
                </div>

                {/* Team Members Grid */}
                <div className="grid grid-cols-1 gap-16">
                    {members.map((member, idx) => (
                        <motion.div
                            key={member.key}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.2 }}
                            className="relative group lg:flex items-center gap-16 p-8 lg:p-12 rounded-[3.5rem] bg-card border border-border  hover:bg-muted/30 transition-all duration-700 shadow-sm hover:shadow-xl"
                        >
                            {/* Photo Container */}
                            <div className="flex-shrink-0 w-full lg:w-[400px] h-[500px] rounded-[2.5rem] overflow-hidden bg-muted border border-border relative group-hover:border-primary/30 transition-all duration-700">
                                <Image
                                    src={member.image}
                                    alt={t(`members.${member.key}.name`)}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 400px"
                                    className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"></div>
                                <div className="absolute bottom-8 left-8 right-8 flex justify-center gap-4 relative z-10">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="LinkedIn"
                                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-primary transition-all h-auto w-auto shadow-none"
                                    >
                                        <Linkedin className="w-5 h-5 text-white" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        aria-label="Email"
                                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-primary transition-all h-auto w-auto shadow-none"
                                    >
                                        <Mail className="w-5 h-5 text-white" />
                                    </Button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 mt-12 lg:mt-0 space-y-8 text-center lg:text-left rtl:lg:text-right">
                                <div className="space-y-4">
                                    <div className={`w-12 h-12 rounded-2xl ${member.bg} flex items-center justify-center mx-auto lg:mx-0`}>
                                        <member.icon className={`w-6 h-6 ${member.color}`} />
                                    </div>
                                    <h2 className="text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
                                        {t(`members.${member.key}.name`)}
                                    </h2>
                                    <p className={`text-xl font-bold uppercase tracking-widest ${member.color}`}>
                                        {t(`members.${member.key}.role`)}
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-6 top-0 bottom-0 w-1 bg-primary/10 opacity-30 rounded-full hidden lg:block rtl:hidden"></div>
                                    <div className="absolute -right-6 top-0 bottom-0 w-1 bg-primary/10 opacity-30 rounded-full hidden lg:block ltr:hidden"></div>
                                    <p className="text-lg text-muted-foreground leading-relaxed font-light">
                                        {t(`members.${member.key}.desc`)}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 rounded-3xl bg-muted/50 border border-border space-y-2">
                                        <GraduationCap className="w-5 h-5 text-muted-foreground" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("expertise")}</p>
                                        <p className="text-sm text-foreground/80">{t("strategy")}</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-muted/50 border border-border space-y-2">
                                        <Award className="w-5 h-5 text-muted-foreground" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{t("focus")}</p>
                                        <p className="text-sm text-foreground/80">{t("innovation")}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Quote / Vision Section */}
                <motion.section
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mt-40 p-12 md:p-24 rounded-[4rem] bg-primary/10 border border-blue-500/10 text-center space-y-12"
                >
                    <div className="relative inline-block">
                        <span className="text-8xl font-serif absolute -top-12 -left-12 opacity-10 text-primary">"</span>
                        <h2 className="text-3xl md:text-5xl font-light italic text-foreground max-w-4xl mx-auto leading-tight">
                            {t("quote")}
                        </h2>
                        <span className="text-8xl font-serif absolute -bottom-24 -right-12 opacity-10 text-primary">"</span>
                    </div>
                </motion.section>

                {/* Who We Are & Tech Driven Section */}
                <div className="mt-40 space-y-32">
                    <WhoWeAreSection />
                </div>
            </Container>
        </main>
    );
}

function WhoWeAreSection() {
    const t = useTranslations("WhoWeAre");

    return (
        <section className="space-y-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
                <div className="space-y-8">
                    <div className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest">
                        {t("badge")}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight leading-tight">
                        {t("title")}
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed font-light">
                        {t("intro")}
                    </p>
                </div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="p-10 lg:p-14 rounded-[3.5rem] bg-card border border-border relative overflow-hidden group hover:border-primary/30 transition-all duration-500 shadow-sm hover:shadow-xl"
                >
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                        <Cpu className="w-64 h-64" />
                    </div>
                    <div className="relative z-10 space-y-8">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <Cpu className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-3xl font-bold text-foreground tracking-tight">
                            {t("tech_driven.title")}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed font-light">
                            {t("tech_driven.desc")}
                        </p>
                        <div className="flex flex-wrap gap-4">
                            {["speech_to_text", "deep_learning", "fingerprinting", "secure_architecture"].map((tag) => (
                                <span key={tag} className="px-4 py-2 rounded-xl bg-muted border border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    {t(`tech_driven.tags.${tag}`)}
                                </span>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

