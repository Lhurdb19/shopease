import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export type Testimonial = {
  id: string;
  name: string;
  location?: string;
  title?: string;
  quote: string;
  avatar?: string;
  rating?: number; // 1-5
};

const defaultTestimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Adira Okonkwo",
    location: "Lagos",
    title: "Executive Stylist",
    avatar: "/avatars/adira.jpg",
    rating: 5,
    quote:
      "Shopease is a study in refined e‑commerce. Every detail — from curated product selections to sumptuous packaging — communicates quality. Their concierge‑level support makes shopping effortless.",
  },
  {
    id: "t2",
    name: "Olu Morgan",
    location: "Victoria Island",
    title: "Architect",
    avatar: "/avatars/olu.jpg",
    rating: 5,
    quote:
      "Impeccable standards and exquisite service. My purchases arrive in flawless condition and the delivery experience feels bespoke — just what a discerning shopper expects.",
  },
  {
    id: "t3",
    name: "Farida Bello",
    location: "Abuja",
    title: "Brand Director",
    avatar: "/avatars/farida.jpg",
    rating: 5,
    quote:
      "From product authenticity to white‑glove delivery, Shopease delivers a luxury experience every time. It’s the one‑stop destination for premium shopping in Nigeria.",
  },
  {
    id: "t4",
    name: "Kene Uche",
    location: "Port Harcourt",
    title: "Collector",
    avatar: "/avatars/kene.jpg",
    rating: 5,
    quote:
      "A rare blend of elegance and reliability — Shopease treats every order like a personal invitation. The attention to detail is exceptional.",
  },
];

type Props = {
  testimonials?: Testimonial[];
  variant?: "grid" | "carousel"; // carousel uses simple horizontal scroll on mobile
};

export default function TestimonialCards({
  testimonials = defaultTestimonials,
  variant = "grid",
}: Props) {
  return (
    <section className="py-12 dark:bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-green-600">
            What our discerning customers are saying
          </h2>
          <p className="mt-2 text-sm md:text-base text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
            Real experiences from premium shoppers who appreciate quality, service and style.
          </p>
        </div>

        {variant === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
              >
                <Card className="h-full border-0 shadow-lg rounded-2xl overflow-hidden">
                  <CardHeader className="flex items-start gap-4 px-4">
                      {/* <Avatar>
                        <img src={t.avatar || "/placeholder-avatar.png"} alt={t.name} />
                      </Avatar> */}
                    <div className="flex-1">
                      <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                        {t.name}
                        {t.title ? <span className="block text-xs text-gray-500">{t.title}</span> : null}
                      </CardTitle>
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <Badge variant="outline" className="text-xs text-green-600">
                          {t.location}
                        </Badge>
                        <div className="text-xs text-yellow-500">{"★".repeat(t.rating || 5)}</div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-5 pb-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300 italic">“{t.quote}”</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          // carousel / horizontal scroll for mobile-friendly layout
          <div className="overflow-x-auto -mx-4 px-4 py-2">
            <div className="flex gap-4 w-max">
              {testimonials.map((t) => (
                <div key={t.id} className="min-w-[280px] max-w-sm">
                  <Card className="h-full border-0 shadow-lg rounded-2xl overflow-hidden">
                    <CardHeader className="flex items-start gap-4 p-4">
                      <Avatar>
                        <img src={t.avatar || "/placeholder-avatar.png"} alt={t.name} />
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-sm font-semibold text-gray-900 dark:text-white">
                          {t.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{t.location}</Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="px-4 pb-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic">“{t.quote}”</p>
                    </CardContent>

                    <CardFooter className="px-4 pb-4 pt-0">
                      <Button variant="ghost" size="sm" className="ml-auto">Read</Button>
                    </CardFooter>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
