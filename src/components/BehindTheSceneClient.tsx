"use client";

import { useTranslations } from "next-intl";
import Container from "@/components/ui/Container";
import { motion } from "framer-motion";
import { Linkedin, Mail, ShieldCheck, Cpu, Award, GraduationCap } from "lucide-react";
import Image from "next/image";

export default function BehindTheSceneClient() {
    const t = useTranslations("Team");

    const members = [
        {
            key: "tamer",
            icon: Award,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20"
        },
        {
            key: "rami",
            icon: ShieldCheck,
            color: "text-indigo-400",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20"
        }
    ];

    return (
        <main className="min-h-screen pt-32 pb-20 bg-slate-950 text-white overflow-hidden">
            <Container>
                {/* Header Section */}
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-semibold uppercase tracking-widest"
                    >
                        <Award className="w-4 h-4" />
                        <span>Leadership Team</span>
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
                        className="text-xl text-slate-400 font-light leading-relaxed"
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
                            className="relative group lg:flex items-center gap-16 p-8 lg:p-12 rounded-[3.5rem] bg-slate-900/30 border border-slate-800 backdrop-blur-xl hover:bg-slate-900/50 transition-all duration-700"
                        >
                            {/* Photo Placeholder */}
                            <div className="flex-shrink-0 w-full lg:w-[400px] h-[500px] rounded-[2.5rem] overflow-hidden bg-slate-950 border border-slate-800 relative group-hover:border-blue-500/30 transition-all duration-700">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="p-12 rounded-full bg-blue-500/5 border border-blue-500/10 group-hover:scale-110 transition-transform duration-700">
                                        <member.icon className={`w-32 h-32 ${member.color} opacity-20`} />
                                    </div>
                                </div>
                                <div className="absolute bottom-8 left-8 right-8 flex justify-center gap-4">
                                    <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-600 transition-all">
                                        <Linkedin className="w-5 h-5 text-white" />
                                    </button>
                                    <button className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-blue-600 transition-all">
                                        <Mail className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 mt-12 lg:mt-0 space-y-8 text-center lg:text-left rtl:lg:text-right">
                                <div className="space-y-4">
                                    <div className={`w-12 h-12 rounded-2xl ${member.bg} flex items-center justify-center mx-auto lg:mx-0`}>
                                        <member.icon className={`w-6 h-6 ${member.color}`} />
                                    </div>
                                    <h2 className="text-4xl lg:text-5xl font-bold text-white tracking-tight">
                                        {t(`members.${member.key}.name`)}
                                    </h2>
                                    <p className={`text-xl font-bold uppercase tracking-widest ${member.color}`}>
                                        {t(`members.${member.key}.role`)}
                                    </p>
                                </div>

                                <div className="relative">
                                    <div className="absolute -left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-transparent opacity-30 rounded-full hidden lg:block rtl:hidden"></div>
                                    <div className="absolute -right-6 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-transparent opacity-30 rounded-full hidden lg:block ltr:hidden"></div>
                                    <p className="text-lg text-slate-400 leading-relaxed font-light">
                                        {t(`members.${member.key}.desc`)}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-6 rounded-3xl bg-slate-950/50 border border-slate-800 space-y-2">
                                        <GraduationCap className="w-5 h-5 text-slate-500" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Expertise</p>
                                        <p className="text-sm text-slate-300">Strategy & Leadership</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-slate-950/50 border border-slate-800 space-y-2">
                                        <Award className="w-5 h-5 text-slate-500" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Focus</p>
                                        <p className="text-sm text-slate-300">AI Innovation</p>
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
                    className="mt-40 p-12 md:p-24 rounded-[4rem] bg-gradient-to-br from-blue-600/10 to-transparent border border-blue-500/10 text-center space-y-12"
                >
                    <div className="relative inline-block">
                        <span className="text-8xl font-serif absolute -top-12 -left-12 opacity-10 text-blue-500">"</span>
                        <h2 className="text-3xl md:text-5xl font-light italic text-white max-w-4xl mx-auto leading-tight">
                            At Almstkshf, we are not just analysts; we are architects of clarity in an era of information overload.
                        </h2>
                        <span className="text-8xl font-serif absolute -bottom-24 -right-12 opacity-10 text-blue-500">"</span>
                    </div>
                </motion.section>
            </Container>
        </main>
    );
}
