"use client";

import { useState, useMemo } from "react";
import {
  ChevronDown,
  Settings,
  Search,
  Phone,
  Mail,
  MessageCircle,
  Home,
} from "lucide-react";
import Link from "next/link";

type FAQItem = {
  question: string;
  answer: string;
};

type FAQGroup = {
  title: string;
  items: FAQItem[];
};

const faqData: FAQGroup[] = [
  {
    title: "Orders",
    items: [
      {
        question: "How do I place an order on Shopease?",
        answer:
          "Simply browse products, add items to your cart, and proceed to checkout. Fill in your delivery information and choose a payment method to complete your purchase.",
      },
      {
        question: "Can I cancel or change my order?",
        answer:
          "Orders can only be cancelled or changed within the first 30 minutes after placing them. Visit your Order Details page to make changes.",
      },
    ],
  },
  {
    title: "Shipping & Delivery",
    items: [
      {
        question: "How long will delivery take?",
        answer:
          "Standard delivery takes 2–5 business days depending on your location. Express delivery (24–48 hours) is available in selected cities.",
      },
      {
        question: "Do you offer same-day delivery?",
        answer:
          "Yes! Same-day delivery is available for Lagos orders placed before 12 noon.",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    items: [
      {
        question: "What is your return policy?",
        answer:
          "You may return eligible items within 7 days of delivery if the product is unused and in its original packaging.",
      },
      {
        question: "How long does it take to get my refund?",
        answer:
          "Refunds are processed within 24–72 hours after the returned item has been received and inspected.",
      },
    ],
  },
  {
    title: "Payments",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept cards, bank transfers, mobile money, and cash-on-delivery (in selected cities).",
      },
      {
        question: "Is my payment information secure?",
        answer:
          "Yes, Shopease uses encrypted payment gateways and never stores your card details.",
      },
    ],
  },
  {
    title: "Account & Security",
    items: [
      {
        question: "Do I need an account to shop?",
        answer:
          "You can browse without an account, but you need one to place orders, track deliveries, and manage returns.",
      },
      {
        question: "I forgot my password. What should I do?",
        answer:
          "Click the 'Forgot Password' link on the login page to reset your password securely.",
      },
    ],
  },
  {
    title: "Customer Support",
    items: [
      {
        question: "How can I contact customer support?",
        answer:
          "You can reach our support team via live chat, email at support@shopease.com, or phone at +234 701 156 0069.",
      },
      {
        question: "What are your support hours?",
        answer:
          "Our team is available 24/7 to support your shopping experience.",
      },
    ],
  },
];

export default function FAQPage() {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const toggleItem = (key: string) => {
    setOpenItem(openItem === key ? null : key);
  };

  // Filter FAQ
  const filteredData = useMemo(() => {
    if (!search.trim()) return faqData;

    const lower = search.toLowerCase();

    return faqData
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.question.toLowerCase().includes(lower) ||
            item.answer.toLowerCase().includes(lower)
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [search]);

  return (
    <div className="min-h-screen px-4 md:px-16 lg:px-24 py-12 dark:bg-black dark:text-white">

      {/* 📌 BREADCRUMB */}
      <nav className="mb-8 text-sm text-gray-500 flex items-center gap-2">
        <Home className="h-4 w-4" />
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        /
        <span className="text-gray-700 dark:text-gray-300"> Help Center</span>
      </nav>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* 📌 LEFT SIDEBAR */}
        <aside className="md:col-span-1 space-y-6">
          <h3 className="font-bold text-lg">Help Center</h3>

          <div className="space-y-3">
            {faqData.map((g, i) => (
              <p
                key={i}
                className="px-4 py-2 rounded-md bg-gray-100 dark:bg-white text-gray-800 font-medium"
              >
                {g.title}
              </p>
            ))}
          </div>

          {/* QUICK CONTACT */}
          <div className="mt-10 p-4 bg-blue-50 dark:bg-white rounded-xl">
            <h4 className="font-bold mb-2">Need Quick Help?</h4>
            <p className="text-sm mb-4">We’re here to assist you.</p>

            <p className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4" /> +234 701 156 0069
            </p>
            <p className="flex items-center gap-2 text-sm mt-2">
              <Mail className="h-4 w-4" /> support@shopease.com
            </p>
          </div>
        </aside>

        {/* 📌 MAIN CONTENT */}
        <main className="md:col-span-3">

          {/* HEADER */}
          <h1 className="text-xl md:text-3xl font-bold text-center mb-3">
            Frequently Asked Questions
          </h1>

          {/* SEARCH BOX */}
          <div className="flex items-center gap-3 bg-gray-100 dark:bg-white px-4 py-2 rounded-full mb-10">
            <Search className="h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent w-full outline-none text-sm md:text-lg text-gray-700"
            />
          </div>

          {/* FAQ LIST */}
          {filteredData.map((group, gIndex) => (
            <div key={gIndex} className="mb-10">
              <h2 className="text-lg md:text-2xl font-semibold mb-2 flex items-center gap-2">
                <Settings /> {group.title}
              </h2>

              <div className="space-y-3">
                {group.items.map((item, iIndex) => {
                  const key = `${gIndex}-${iIndex}`;
                  const isOpen = openItem === key;

                  return (
                    <div
                      key={key}
                      className="rounded-xl shadow-sm border dark:bg-white dark:text-gray-800 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(key)}
                        className="w-full px-5 py-4 flex justify-between items-center text-left"
                      >
                        <span className="font-bold text-sm md:text-xl">
                          {item.question}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-4 text-gray-600 text-xs md:text-lg leading-6 md:leading-8 italic">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* STILL NEED HELP */}
          <div className="mt-16 text-center py-10 bg-gray-100 dark:bg-white rounded-xl">
            <h2 className="text-lg md:text-2xl font-bold mb-3 dark:text-black">
              Still need help?
            </h2>
            <p className="text-gray-700 mb-5">
              Our support team is always available to assist you.
            </p>

            <Link
              href="#support-form"
              className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700"
            >
              Contact Support
            </Link>
          </div>

          {/* SUPPORT FORM */}
          <div id="support-form" className="mt-20">
            <h3 className="text-xl md:text-2xl font-bold mb-4">
              Contact Support
            </h3>

            <form className="space-y-4">
              <input
                required
                placeholder="Full Name"
                className="w-full px-4 py-3 border rounded-lg dark:bg-white dark:text-black"
              />
              <input
                required
                placeholder="Email Address"
                className="w-full px-4 py-3 border rounded-lg dark:bg-white dark:text-black"
              />
              <textarea
                required
                placeholder="Describe your issue..."
                rows={5}
                className="w-full px-4 py-3 border rounded-lg dark:bg-white dark:text-black"
              ></textarea>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
              >
                Submit Ticket
              </button>
            </form>
          </div>
        </main>
      </div>

      {/* FLOATING LIVE CHAT BUTTON */}
      {/* <button className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700">
        <MessageCircle className="h-6 w-6" />
      </button> */}
    </div>
  );
}
