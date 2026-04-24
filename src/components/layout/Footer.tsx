import { Dumbbell, Instagram, MapPin, Phone, Mail, Clock } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer id="contact" className="relative bg-[#0A0A0A] border-t border-white/5 pt-16 pb-8">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E8192B]/30 to-transparent" />

            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <img src="/logoroman.png" alt="Roman Fitness" className="w-10 h-10 object-contain" style={{ filter: "drop-shadow(0 0 6px rgba(232, 25, 43, 0.3))" }} />
                            <span className="font-heading text-xl tracking-[0.15em]">
                                <span className="text-white">ROMAN</span>{" "}
                                <span className="text-[#E8192B]">FITNESS</span>
                            </span>
                        </Link>
                        <p className="text-white/30 text-sm leading-relaxed">
                            The premium fitness empire in Periyanaickenpalayam, Coimbatore. Elite equipment, expert training, and real transformations.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <a
                                href="https://www.instagram.com/mfp_pnp_/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-9 h-9 rounded border border-white/10 flex items-center justify-center hover:border-[#E8192B]/50 hover:bg-[#E8192B]/10 transition-all duration-300"
                            >
                                <Instagram className="w-4 h-4 text-white/50 hover:text-[#E8192B]" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-heading text-lg tracking-wider mb-4 text-white/80">Quick Links</h4>
                        <ul className="space-y-2">
                            {[
                                { name: "Home", href: "/#home" },
                                { name: "Features", href: "/#features" },
                                { name: "Trainers", href: "/#trainers" },
                                { name: "Membership", href: "/#plans" },
                                { name: "Diet AI", href: "/diet" },
                            ].map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-sm text-white/30 hover:text-[#E8192B] transition-colors duration-300">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services */}
                    <div>
                        <h4 className="font-heading text-lg tracking-wider mb-4 text-white/80">Services</h4>
                        <ul className="space-y-2 text-sm text-white/30">
                            <li>Personal Training</li>
                            <li>Body Transformation</li>
                            <li>Strength Training</li>
                            <li>Cardio Programs</li>
                            <li>AI Diet Plans</li>
                            <li>Contest Preparation</li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-heading text-lg tracking-wider mb-4 text-white/80">Contact</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-4 h-4 text-[#E8192B]/50 mt-0.5 flex-shrink-0" />
                                <a
                                    href="https://maps.google.com/?q=11.1551686,76.9505951"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-white/30 hover:text-[#E8192B] transition-colors"
                                >
                                    No 17, Bhagat Singh Nagar, Periyanaickenpalayam, Tamil Nadu 641020
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-4 h-4 text-[#E8192B]/50 flex-shrink-0" />
                                <a href="tel:+918098834154" className="text-sm text-white/30 hover:text-[#E8192B] transition-colors">
                                    080988 34154
                                </a>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-4 h-4 text-[#E8192B]/50 flex-shrink-0" />
                                <a href="mailto:mfppnproman@gmail.com" className="text-sm text-white/30 hover:text-[#E8192B] transition-colors">
                                    mfppnproman@gmail.com
                                </a>
                            </li>
                            <li className="flex items-start gap-3">
                                <Clock className="w-4 h-4 text-[#E8192B]/50 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-white/30">
                                    <p>Mon - Sat: 5 AM - 11 AM, 5 PM - 9 PM</p>
                                    <p className="text-[#E8192B]/40">Sunday: Holiday</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-center gap-2 text-xs text-white/20">
                    <span>&copy; {new Date().getFullYear()} Roman Fitness. All rights reserved.</span>
                    <span className="hidden md:inline text-white/10">|</span>
                    <span className="flex items-center gap-1">
                        Designed and powered by
                        <Link href="https://elevexsocials.vercel.app/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center transition-opacity hover:opacity-80">
                            <img src="/elevexsocialslogo.png" alt="Elevex Socials" className="h-12 w-auto opacity-50 hover:opacity-80 transition-opacity" />
                        </Link>
                    </span>
                </div>
            </div>
        </footer>
    );
}
