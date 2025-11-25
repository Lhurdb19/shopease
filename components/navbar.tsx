"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  FileText,
  ShoppingCart,
  User,
  ChevronDown,
  Heart,
  Menu,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/contexts/SettingsContext";
import Image from "next/image";
import { useCart } from "@/hooks/useCart";

export default function Navbar() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [blogOpen, setBlogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { settings } = useSettings();
  const { data: cart } = useCart();

  const cartCount =
    cart?.items?.reduce(
      (sum: number, item: { quantity: number }) => sum + item.quantity,
      0
    ) || 0;

  // Categories state
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [catsLoading, setCatsLoading] = useState(false);

  /** Fetch search suggestions */
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/products/search?q=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch {
        toast.error("Failed to fetch suggestions");
      }
    };
    const timer = setTimeout(fetchSuggestions, 50);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  /** Fetch categories once */
  useEffect(() => {
    let mounted = true;
    const loadCategories = async () => {
      setCatsLoading(true);
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        if (mounted && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setCatsLoading(false);
      }
    };
    loadCategories();
    return () => {
      mounted = false;
    };
  }, []);

  /** Close dropdowns when clicking outside */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node))
        setDropdownOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target as Node))
        setShowSuggestions(false);
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(event.target as Node)
      )
        setCategoriesOpen(false);
      if (pagesRef.current && !pagesRef.current.contains(event.target as Node))
        setPagesOpen(false);
      if (blogRef.current && !blogRef.current.contains(event.target as Node))
        setBlogOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      toast.warning("Please enter a product name");
      return;
    }
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setShowSuggestions(false);
    setSearchQuery("");
  };

  const handleSuggestionClick = (_id: string) => {
    router.push(`/products/${_id}`);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    toast.success("Logged out successfully");
  };

  return (
    <>
      <nav className="bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
        <div className="max-w-8xl mx-auto px-4 lg:px-8 xl:px-25 py-4">
          <div className="h-16 flex items-center justify-between">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 w-[200px]">
              {settings?.logo ? (
                <Image
                  src={settings.logo}
                  alt={settings.siteName || "Logo"}
                  width={200}
                  height={60}
                  className="object-cover -translate-x-6"
                />
              ) : (
                <h1 className="text-2xl font-bold">
                  <span className="text-green-600">Shop</span>Ease
                </h1>
              )}
            </Link>

            {/* Search */}
            <div ref={searchRef} className="relative hidden md:flex w-[350px]">
              <form onSubmit={handleSubmit} className="w-full">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="rounded-xl border-gray-300 dark:border-gray-700 pl-4"
                />
              </form>

              {/* Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 mt-2 overflow-hidden z-50">
                  {suggestions.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => handleSuggestionClick(item._id)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <span>{item.title}</span>
                      <span className="font-semibold text-green-600">
                        ₦{Number(item.price).toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>


            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">

              <Link href="/products" className="hover:text-green-600 transition">
                Marketplace
              </Link>

              {/* Categories */}
              <div className="relative" ref={categoriesRef}>
                <button
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="flex items-center gap-1 hover:text-green-600"
                >
                  Categories <ChevronDown className="w-4 h-4" />
                </button>

                {categoriesOpen && (
                  <div className="absolute mt-3 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 max-h-64 overflow-y-auto z-50">
                    {catsLoading ? (
                      <p className="px-4 py-2 text-gray-500 text-sm">Loading...</p>
                    ) : categories.length === 0 ? (
                      <p className="px-4 py-2 text-gray-500 text-sm">No categories</p>
                    ) : (
                      categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/category/${encodeURIComponent(cat.id)}`}
                          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          {cat.name}
                        </Link>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Pages */}
              <div className="relative" ref={pagesRef}>
                <button
                  onClick={() => setPagesOpen(!pagesOpen)}
                  className="flex items-center gap-1 hover:text-green-600"
                >
                  Pages <ChevronDown className="w-4 h-4" />
                </button>

                {pagesOpen && (
                  <div className="absolute mt-3 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <Link
                      href="/about"
                      onClick={() => setPagesOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      About Us
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setPagesOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Contact
                    </Link>
                    <Link
                      href="/faq"
                      onClick={() => setPagesOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      FAQ / Help
                    </Link>
                  </div>
                )}
              </div>

              {/* Blog */}
              <div className="relative" ref={blogRef}>
                <button
                  onClick={() => setBlogOpen(!blogOpen)}
                  className="flex items-center gap-1 hover:text-green-600"
                >
                  Blog <ChevronDown className="w-4 h-4" />
                </button>

                {blogOpen && (
                  <div className="absolute mt-3 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                    <Link
                      href="/blog"
                      onClick={() => setBlogOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      All Posts
                    </Link>
                    <Link
                      href="/blog/latest"
                      onClick={() => setBlogOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Latest
                    </Link>
                    <Link
                      href="/blog/popular"
                      onClick={() => setBlogOpen(false)}
                      className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Popular
                    </Link>
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <button
                onClick={() => {
                  if (!session?.user) {
                    toast.warning("Please login first");
                    router.push("/auth/login");
                    return;
                  }
                  router.push("/user/wishlist");
                }}
                className="hover:text-green-600"
              >
                <Heart className="w-5 h-5" />
              </button>

              {/* Cart */}
              <Link href="/cart" className="relative hover:text-green-600">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Dropdown */}
              <div ref={dropdownRef} className="relative">
                {session?.user ? (
                  <>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center justify-between px-2 hover:text-gray-600 bg-green-600 text-white hover: font-bold uppercase w-20 h-10 rounded-4xl cursor-pointer hover:translate-x-1"
                    >
                      {/* <User className="w-5 h-5" /> */}
                      {session.user.name.slice(0, 2)}
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                        <Link
                          href="/user/profile"
                          onClick={() => setDropdownOpen(false)}
                          className="flex gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <User className="w-4 h-4 text-green-600" /> Profile
                        </Link>
                        <Link
                          href="/user/notifications"
                          onClick={() => setDropdownOpen(false)}
                          className="flex gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <FileText className="w-4 h-4 text-green-600" /> Notifications
                        </Link>

                        <button
                          onClick={handleLogout}
                          className="flex gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link href="/auth/login" className="hover:text-green-600">
                    Login
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[60%] bg-white dark:bg-gray-900 flex flex-col">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
                </SheetHeader>

                <div className="flex flex-col p-4 space-y-3 text-sm">
                  {/* Products */}
                  <SheetClose asChild>
                    <Link href="/products" className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded">
                      <Box className="w-5 h-5 text-green-600" /> Products
                    </Link>
                  </SheetClose>

                  {/* Categories Accordion */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="categories">
                      <AccordionTrigger className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded w-full">
                        <Grid className="w-5 h-5 text-green-600" /> Categories
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col pl-8 pt-2 space-y-1">
                        {catsLoading ? (
                          <div className="text-gray-500 text-sm">Loading...</div>
                        ) : categories.length === 0 ? (
                          <div className="text-gray-500 text-sm">No categories</div>
                        ) : (
                          categories.map((cat) => (
                            <SheetClose asChild key={cat.id}>
                              <Link
                                href={`/category/${encodeURIComponent(cat.id)}`}
                                className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded text-sm"
                              >
                                <Grid className="w-4 h-4 text-green-500" />
                                {cat.name}
                              </Link>
                            </SheetClose>
                          ))
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Pages Accordion */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="pages">
                      <AccordionTrigger className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded w-full">
                        <FileText className="w-5 h-5 text-green-600" /> Pages
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col pl-8 pt-2 space-y-1">
                        <SheetClose asChild>
                          <Link href="/about" className="flex items-center gap-2 py-1 hover:bg-gray-100 rounded text-sm">
                            <FileText className="w-4 h-4 text-green-500" /> About Us
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/contact" className="flex items-center gap-2 py-1 hover:bg-gray-100 rounded text-sm">
                            <FileText className="w-4 h-4 text-green-500" /> Contact Us
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/faq" className="flex items-center gap-2 py-1 hover:bg-gray-100 rounded text-sm">
                            <FileText className="w-4 h-4 text-green-500" /> FAQ / Help
                          </Link>
                        </SheetClose>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Blog Accordion */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="blog">
                      <AccordionTrigger className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded w-full">
                        <FileText className="w-5 h-5 text-green-600" /> Blog
                      </AccordionTrigger>
                      <AccordionContent className="flex flex-col pl-8 pt-2 space-y-1">
                        <SheetClose asChild>
                          <Link href="/blog" className="flex items-center gap-2 py-1 hover:bg-gray-100 rounded text-sm">
                            <FileText className="w-4 h-4 text-green-500" /> All Posts
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/blog/latest" className="flex items-center gap-2 py-1 hover:bg-gray-100 rounded text-sm">
                            <FileText className="w-4 h-4 text-green-500" /> Latest
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/blog/popular" className="flex items-center gap-2 py-1 hover:bg-gray-100 rounded text-sm">
                            <FileText className="w-4 h-4 text-green-500" /> Popular
                          </Link>
                        </SheetClose>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Cart */}
                  <SheetClose asChild>
                    <Link href="/cart" className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded text-sm">
                      <ShoppingCart className="w-5 h-5 text-green-600" /> Cart
                      {cartCount > 0 && (
                        <span className="ml-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </SheetClose>

                  {/* User / Auth */}
                  {session?.user ? (
                    <>
                      <SheetClose asChild>
                        <Link href="/user/profile" className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded text-sm">
                          <User className="w-5 h-5 text-green-600" /> My Profile
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/user/orders" className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded text-sm">
                          <FileText className="w-5 h-5 text-green-600" /> My Orders
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 py-2 text-red-600 hover:bg-gray-100 rounded text-sm"
                        >
                          Logout
                        </button>
                      </SheetClose>
                    </>
                  ) : (
                    <SheetClose asChild>
                      <Link href="/auth/login" className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded text-sm">
                        <User className="w-5 h-5 text-green-600" /> Login
                      </Link>
                    </SheetClose>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

    </>
  );
}
