"use client";
import Head from "next/head";
import {
    ShieldCheck,
    Download,
    // Chrome,
    Compass,
    Shield,
    Globe,
    BadgeCheck,
    RefreshCcwDot,
    ScrollText,
    AlertTriangle,
    Fingerprint,
    BarChart2,
    Check,
    Brain,
    Flag,
    ShieldX,
    CircleAlert,
    LockOpen,
    Sparkles,
    Zap,
    Wand2,
    Leaf,
    SlidersHorizontal,
    Lock,
    Send,
    Share2,
    AtSign,
} from "lucide-react";
import { Canvas } from "@react-three/fiber";
import WireframeSphere from "./components/WireframeSphere";
import ParticleSphere from "./components/ParticleSphere";
import Image from "next/image";

export default function Home() {
    return (
        <>
            <Head>
                <meta charSet="utf-8" />
                <meta content="width=device-width, initial-scale=1.0" name="viewport" />
                <title>PhishGuard | AI-Powered Phishing Protection</title>
                {/* <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script> */}
                <link
                    href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <style>{`
                .font-headline { font-family: "Plus Jakarta Sans", Inter, sans-serif; }
                .font-body { font-family: Inter, sans-serif; }
                .font-label { font-family: Inter, sans-serif; }
                .rounded-full { border-radius: 9999px; }
                .rounded-2xl { border-radius: 1rem; }
                .rounded-3xl { border-radius: 2rem; }
                .rounded-xl { border-radius: 0.75rem; }
                .mesh-gradient {
                    background:
                        radial-gradient(circle at 10% 10%, rgba(255, 220, 150, 0.25) 0%, transparent 40%),
                        radial-gradient(circle at 40% 20%, rgba(124, 65, 181, 0.3) 0%, transparent 60%),
                        radial-gradient(circle at 90% 10%, rgba(47, 46, 190, 0.2) 0%, transparent 50%),
                        radial-gradient(circle at 50% 100%, rgba(12, 12, 29, 1) 0%, #050510 100%);
                }
                .glass-panel {
                    background: rgba(36, 35, 59, 0.4);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(193, 133, 253, 0.1);
                }
                .hero-glow { box-shadow: 0 0 40px rgba(193, 133, 253, 0.2); }
                .tight-heading { letter-spacing: -0.04em; }
            `}</style>
            <body className="bg-[#050510] text-[#e6e3fb] font-body selection:bg-[#cb97ff]/30">
                {/* TopNavBar */}
                <nav className="fixed top-0 w-full z-50 bg-[#050510]/20 backdrop-blur-xl">
                    <div className="flex justify-between items-center max-w-7xl mx-auto px-8 py-4">
                        <div className="flex items-center gap-2 text-xl font-bold text-slate-50 font-headline tracking-tight">
                            <ShieldCheck className="text-[#cb97ff] w-6 h-6" />
                            TrustInbox
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a className="text-[#aba9bf] font-medium font-body hover:text-[#cb97ff] transition-colors duration-300" href="#">
                                How it Works
                            </a>
                            <a className="text-[#aba9bf] font-medium font-body hover:text-[#cb97ff] transition-colors duration-300" href="#">
                                Features
                            </a>
                            <a className="text-[#aba9bf] font-medium font-body hover:text-[#cb97ff] transition-colors duration-300" href="#">
                                Privacy
                            </a>
                        </div>
                        <button className="bg-[#cb97ff] text-[#000000] px-6 py-2.5 rounded-full font-bold hover:scale-95 transition-transform active:scale-90 hero-glow text-sm">
                            Add to Chrome
                        </button>
                    </div>
                </nav>

                <main className="relative overflow-hidden">
                    {/* Hero Section */}
                    <section className="relative min-h-screen pt-32 pb-20 flex flex-col items-center justify-center px-8 overflow-hidden">
                        <div className="absolute inset-0 -z-10 mesh-gradient"></div>
                        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
                            <div className="space-y-8 z-10">
                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#cb97ff]/10 border border-[#cb97ff]/20 text-[#cb97ff] text-xs font-bold tracking-wider uppercase">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#cb97ff] animate-pulse"></span>
                                    AI-Powered Real-Time Defense
                                </div>
                                <h1 className="text-5xl md:text-7xl font-extrabold font-light tight-heading leading-[1.05] text-[#e6e3fb]">
                                    Detect Phishing <br />
                                    <span className="text-[#cb97ff]">Before it Strikes.</span>
                                </h1>
                                <p className="text-lg md:text-xl text-[#aba9bf] max-w-lg leading-relaxed font-body">
                                    A lightweight browser extension that scans every site you visit to keep your data safe from malicious phishing
                                    attacks. Real-time AI protection.
                                </p>
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <button className="px-8 py-4 bg-[#cb97ff] text-[#000000] rounded-full font-bold text-lg hover:brightness-110 transition-all flex items-center gap-2 hero-glow">
                                        <Download className="w-5 h-5" />
                                        Add to Chrome
                                    </button>
                                    <button className="px-8 py-4 bg-[#24233b] text-[#e6e3fb] rounded-full font-bold text-lg hover:bg-[#2a2a43] transition-all border border-[#474659]/20">
                                        Learn More
                                    </button>
                                </div>
                                <div className="pt-12">
                                    <p className="text-xs font-bold text-[#aba9bf] mb-6 uppercase tracking-[0.2em] opacity-60">Works on:</p>
                                    <div className="flex items-center gap-10 grayscale opacity-40">
                                        <div className="flex items-center gap-2">
                                            <Compass className="w-6 h-6" />
                                            <span className="font-bold text-sm">Google Chrome</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Shield className="w-6 h-6" />
                                            <span className="font-bold text-sm">Brave</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Globe className="w-6 h-6" />
                                            <span className="font-bold text-sm">Edge</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-0 z-0">
                                <Canvas
                                    camera={{ position: [0, 0, 6], fov: 45 }}
                                    gl={{ alpha: true, antialias: true }}
                                    style={{ background: "transparent" }}
                                >
                                    <ambientLight intensity={0.3} />
                                    <pointLight position={[5, 5, 5]} intensity={0.5} color="#4f7cff" />
                                    <pointLight position={[-5, -5, 3]} intensity={0.3} color="#6b5ce7" />
                                    <ParticleSphere />
                                    <WireframeSphere />
                                </Canvas>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: How it Does It */}
                    <section className="py-32 px-8 bg-[#121223]/30 relative">
                        <div className="max-w-7xl mx-auto">
                            <div className="grid lg:grid-cols-2 gap-20 items-center">
                                {/* <div className="relative aspect-video glass-panel rounded-2xl overflow-hidden flex items-center justify-center p-12 shadow-2xl">
                                    <div className="absolute inset-0 bg-[#cb97ff]/5"></div>
                                    <div className="relative space-y-6 w-full">
                                        <div className="h-2.5 w-3/4 bg-[#18182b] rounded-full opacity-50"></div>
                                        <div className="h-2.5 w-1/2 bg-[#18182b] rounded-full opacity-30"></div>
                                        <div className="flex gap-4 items-center">
                                            <div className="h-10 w-10 rounded-full bg-[#cb97ff]/20 flex items-center justify-center">
                                                <div className="w-4 h-4 rounded-full bg-[#cb97ff]/40"></div>
                                            </div>
                                            <div className="h-10 flex-1 bg-[#cb97ff]/10 rounded-xl"></div>
                                        </div>
                                        <div className="h-2.5 w-full bg-[#18182b] rounded-full opacity-20"></div>
                                        <div className="pt-8 flex justify-center">
                                            <BarChart2 className="w-20 h-20 text-[#cb97ff] animate-pulse" strokeWidth={1.5} />
                                        </div>
                                    </div>
                                </div> */}

                                <div className="relative w-full h-[300px]">
                                    <Image src="/analytic.jpeg" alt="" fill className="rounded-2xl object-cover" />
                                </div>
                                <div className="space-y-8">
                                    <h2 className="text-4xl md:text-5xl font-headline font-bold tight-heading">Intelligent Analysis</h2>
                                    <p className="text-xl text-[#aba9bf] leading-relaxed font-body">
                                        Our AI engine analyzes URLs, SSL certificates, and site code instantly to identify even the newest phishing
                                        threats.
                                    </p>
                                    <ul className="space-y-6 pt-4">
                                        {["URL Structural Inspection", "SSL Chain Verification", "Script Behavior Monitoring"].map((item) => (
                                            <li key={item} className="flex items-center gap-4">
                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#cb97ff]/20 flex items-center justify-center">
                                                    <Check className="text-[#cb97ff] w-4 h-4" strokeWidth={3} />
                                                </div>
                                                <span className="font-semibold text-[#e6e3fb]">{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: How it Works - 3 Steps */}
                    <section className="py-32 px-8">
                        <div className="max-w-7xl mx-auto text-center mb-24">
                            <h2 className="text-4xl md:text-5xl font-headline font-extrabold tight-heading mb-6">Simple 3-Step Protection</h2>
                            <div className="w-16 h-1 bg-[#cb97ff] mx-auto rounded-full"></div>
                        </div>
                        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-16 relative">
                            {/* Step 1 */}
                            <div className="relative group text-center space-y-6 p-8 rounded-3xl transition-all hover:bg-[#1d1d33]/50 border border-transparent hover:border-white/5">
                                <div className="w-24 h-24 bg-[#cb97ff]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#cb97ff]/20 relative">
                                    <span className="absolute -top-1 -right-1 w-8 h-8 bg-[#cb97ff] text-[#000000] rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                                        1
                                    </span>
                                    <Globe className="w-12 h-12 text-[#cb97ff]" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-bold font-headline tight-heading">User visits website</h3>
                                <p className="text-[#aba9bf] font-body leading-relaxed">
                                    Navigate the web as you normally would. PhishGuard works silently in the background.
                                </p>
                            </div>
                            {/* Step 2 */}
                            <div className="relative group text-center space-y-6 p-8 rounded-3xl transition-all hover:bg-[#1d1d33]/50 border border-transparent hover:border-white/5">
                                <div className="w-24 h-24 bg-[#9093ff]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#9093ff]/20 relative">
                                    <span className="absolute -top-1 -right-1 w-8 h-8 bg-[#9093ff] text-[#ccccff] rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                                        2
                                    </span>
                                    <Brain className="w-12 h-12 text-[#9093ff]" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-bold font-headline tight-heading">AI scans URL &amp; Code</h3>
                                <p className="text-[#aba9bf] font-body leading-relaxed">
                                    Instant multi-layered analysis performed locally in milliseconds using advanced AI models.
                                </p>
                            </div>
                            {/* Step 3 */}
                            <div className="relative group text-center space-y-6 p-8 rounded-3xl transition-all hover:bg-[#1d1d33]/50 border border-transparent hover:border-white/5">
                                <div className="w-24 h-24 bg-[#ff8796]/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-[#ff8796]/20 relative">
                                    <span className="absolute -top-1 -right-1 w-8 h-8 bg-[#ff8796] text-[#490013] rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                                        3
                                    </span>
                                    <Flag className="w-12 h-12 text-[#ff8796]" strokeWidth={1.5} />
                                </div>
                                <h3 className="text-2xl font-bold font-headline tight-heading">Protection Warning</h3>
                                <p className="text-[#aba9bf] font-body leading-relaxed">
                                    If a threat is detected, PhishGuard blocks access and explains the potential danger.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Alert Preview */}
                    <section className="py-24 px-8 bg-[#121223]/50">
                        <div className="max-w-5xl mx-auto">
                            <div className="glass-panel p-10 md:p-14 rounded-3xl border-l-8 border-l-[#ff6e84] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 opacity-[0.03]">
                                    <AlertTriangle className="w-80 h-80 text-[#ff6e84]" />
                                </div>
                                <div className="flex flex-col md:flex-row items-start gap-8 relative z-10">
                                    <div className="p-5 bg-[#ff6e84]/10 rounded-full flex-shrink-0 shadow-inner">
                                        <ShieldX className="w-16 h-16 text-[#ff6e84]" strokeWidth={1.5} />
                                    </div>
                                    <div className="space-y-8 flex-1">
                                        <div>
                                            <h2 className="text-3xl md:text-4xl font-headline font-extrabold tight-heading text-[#e6e3fb]">
                                                Phishing Threat Detected!
                                            </h2>
                                            <p className="text-lg text-[#aba9bf] mt-3 font-body">PhishGuard has blocked this site for your safety.</p>
                                        </div>
                                        <div className="bg-[#000000]/60 backdrop-blur-sm p-8 rounded-2xl space-y-5 border border-white/5">
                                            <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-[#cb97ff] opacity-80">Threat Report:</h4>
                                            <div className="grid gap-5">
                                                <div className="flex items-center gap-4">
                                                    <CircleAlert className="text-[#ff6e84] w-6 h-6 flex-shrink-0" />
                                                    <span className="text-[#e6e3fb] font-medium">Suspicious domain structure detected</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <LockOpen className="text-[#ff6e84] w-6 h-6 flex-shrink-0" />
                                                    <span className="text-[#e6e3fb] font-medium">Missing or invalid SSL certificate</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Sparkles className="text-[#ff6e84] w-6 h-6 flex-shrink-0" />
                                                    <span className="text-[#e6e3fb] font-medium">Newly created site (under 24 hours old)</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-4">
                                            <button className="px-8 py-4 bg-[#ff6e84] text-white font-bold rounded-full shadow-lg hover:brightness-110 transition-all">
                                                Go Back to Safety
                                            </button>
                                            <button className="px-8 py-4 bg-[#2a2a43] text-[#aba9bf] font-semibold rounded-full text-sm border border-[#474659]/10">
                                                Dismiss Anyway (Risky)
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Features Grid */}
                    <section className="py-32 px-8">
                        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[
                                {
                                    Icon: Zap,
                                    title: "Real-time detection",
                                    desc: "Instant protection as you browse, with zero lag or performance impact on your device.",
                                },
                                {
                                    Icon: Wand2,
                                    title: "AI-based analysis",
                                    desc: "Deep learning models trained on millions of malicious sites and updated hourly.",
                                },
                                {
                                    Icon: Leaf,
                                    title: "Lightweight",
                                    desc: "Ultra-slim extension footprint that won't slow down your page load times.",
                                },
                                {
                                    Icon: SlidersHorizontal,
                                    title: "No setup required",
                                    desc: "Install and stay protected. No complex accounts or configurations needed.",
                                },
                            ].map(({ Icon, title, desc }) => (
                                <div
                                    key={title}
                                    className="bg-[#1d1d33]/40 p-10 rounded-3xl border border-white/5 hover:border-[#cb97ff]/40 transition-all group backdrop-blur-sm"
                                >
                                    <Icon className="text-[#cb97ff] w-10 h-10 mb-8 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                                    <h4 className="text-xl font-bold mb-4 font-headline tight-heading">{title}</h4>
                                    <p className="text-[#aba9bf] text-sm leading-relaxed font-body">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 6: Privacy & Security */}
                    <section className="py-32 px-8 bg-[#000000]/80 border-y border-white/5">
                        <div className="max-w-7xl mx-auto text-center">
                            <div className="inline-flex p-4 bg-[#9093ff]/10 rounded-2xl mb-10 border border-[#9093ff]/20">
                                <Lock className="text-[#9093ff] w-12 h-12" strokeWidth={1.5} />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-headline font-bold tight-heading mb-16">Your Privacy is Our Priority</h2>
                            <div className="grid md:grid-cols-3 gap-16 max-w-5xl mx-auto">
                                <div>
                                    <h4 className="text-xl font-bold mb-5 font-headline tight-heading">No data collection</h4>
                                    <p className="text-[#aba9bf] font-body leading-relaxed">
                                        We never store your history or personal info. All scanning happens locally in your browser environment.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-5 font-headline tight-heading">No tracking</h4>
                                    <p className="text-[#aba9bf] font-body leading-relaxed">
                                        PhishGuard doesn&apos;t use cookies, tracking pixels, or fingerprinting. You remain completely anonymous.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold mb-5 font-headline tight-heading">Secure processing</h4>
                                    <p className="text-[#aba9bf] font-body leading-relaxed">
                                        Our AI models use end-to-end encrypted signals for threat intelligence updates without exposing user data.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Final CTA Section */}
                    <section className="py-40 px-8 relative overflow-hidden">
                        <div className="absolute inset-0 mesh-gradient opacity-30 -z-10"></div>
                        <div className="max-w-4xl mx-auto text-center space-y-12">
                            <h2 className="text-5xl md:text-7xl font-headline font-extrabold tight-heading leading-tight">
                                Get Protected Now.
                                <br />
                                Add to Chrome for Free.
                            </h2>
                            <p className="text-xl text-[#aba9bf] max-w-2xl mx-auto font-body">
                                Join over 500,000 users who trust PhishGuard to keep their digital lives safe from scams and malicious sites.
                            </p>
                            <div className="pt-8">
                                <button className="px-14 py-6 bg-[#cb97ff] text-[#000000] rounded-full font-bold text-2xl hover:scale-105 transition-all shadow-[0_0_60px_rgba(193,133,253,0.4)] hero-glow">
                                    Add to Chrome — It&apos;s Free
                                </button>
                                <p className="mt-8 text-sm text-[#aba9bf] font-semibold tracking-widest uppercase opacity-60">
                                    Available for Chrome, Brave, and Edge
                                </p>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="bg-black w-full py-20 px-8 border-t border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-7xl mx-auto">
                        <div className="space-y-6">
                            <div className="text-2xl font-bold text-white flex items-center gap-2 font-headline tracking-tight">
                                <ShieldCheck className="text-[#cb97ff] w-6 h-6" />
                                PhishGuard AI
                            </div>
                            <p className="text-[#aba9bf] text-sm leading-relaxed font-body">
                                Protecting the digital world from phishing attacks with state-of-the-art AI technology. Simple, fast, and completely
                                private.
                            </p>
                        </div>
                        <div>
                            <h5 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Product</h5>
                            <ul className="space-y-4 font-body text-sm">
                                <li>
                                    <a className="text-[#aba9bf] hover:text-[#cb97ff] transition-all" href="#">
                                        How it Works
                                    </a>
                                </li>
                                <li>
                                    <a className="text-[#aba9bf] hover:text-[#cb97ff] transition-all" href="#">
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a className="text-[#aba9bf] hover:text-[#cb97ff] transition-all" href="#">
                                        Pricing
                                    </a>
                                </li>
                                <li>
                                    <a className="text-[#aba9bf] hover:text-[#cb97ff] transition-all" href="#">
                                        Enterprise
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Support</h5>
                            <ul className="space-y-4 font-body text-sm">
                                <li>
                                    <a className="text-[#aba9bf] hover:text-[#cb97ff] transition-all" href="#">
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a className="text-[#aba9bf] hover:text-[#cb97ff] transition-all" href="#">
                                        Security Docs
                                    </a>
                                </li>
                                <li>
                                    <a className="text-[#aba9bf] hover:text-[#cb97ff] transition-all" href="#">
                                        Contact Us
                                    </a>
                                </li>
                                <li>
                                    <a className="text-[#aba9bf] hover:text-[#cb97ff] transition-all" href="#">
                                        Help Center
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-white font-bold mb-8 uppercase tracking-widest text-xs">Stay Safe</h5>
                            <p className="text-[#aba9bf] text-sm mb-6 font-body">Subscribe to our security newsletter.</p>
                            <div className="flex gap-2">
                                <input
                                    className="bg-[#1d1d33] border-none rounded-xl text-sm px-4 py-3 w-full focus:ring-2 focus:ring-[#cb97ff] text-[#e6e3fb]"
                                    placeholder="Email address"
                                    type="email"
                                />
                                <button className="bg-[#cb97ff] text-[#000000] p-3 rounded-xl hover:brightness-110 transition-all">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-[#aba9bf] text-sm font-body">© 2024 PhishGuard AI. All rights reserved.</p>
                        <div className="flex gap-8">
                            <a className="text-[#aba9bf] hover:text-[#cb97ff] transition-all" href="#">
                                <Share2 className="w-5 h-5" />
                            </a>
                            <a className="text-[#aba9bf] hover:text-[#cb97ff] transition-all" href="#">
                                <AtSign className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </footer>
            </body>
        </>
    );
}
