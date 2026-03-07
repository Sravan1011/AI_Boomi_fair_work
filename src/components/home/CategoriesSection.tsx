import Image from "next/image";
import Link from "next/link";
import { Code, Cpu, Palette, Megaphone } from "lucide-react";

const categories = [
    { name: "Web Development", image: "/images/category-webdev.png", icon: Code },
    { name: "AI Services", image: "/images/category-ai.png", icon: Cpu },
    { name: "Graphic Design", image: "/images/category-design.png", icon: Palette },
    { name: "Digital Marketing", image: "/images/category-marketing.png", icon: Megaphone },
];

export default function CategoriesSection() {
    return (
        <section className="py-16 bg-white">
            <div className="container-custom">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                    Trusted Services
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((category) => (
                        <Link key={category.name} href="/jobs" className="minimal-card group">
                            <div className="relative w-20 h-20 mx-auto mb-4">
                                <Image
                                    src={category.image}
                                    alt={category.name}
                                    fill
                                    className="object-contain"
                                    sizes="80px"
                                />
                            </div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-[#6B5DD3] transition-colors">
                                {category.name}
                            </h3>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
