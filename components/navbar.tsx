"use client";

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
    const timer = setTimeout(fetchSuggestions, 300);
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
      <Toaster richColors position="top-right" />
      <nav className="bg-white/80 backdrop-blur-md shadow-sm dark:bg-gray-900 sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition px-0 lg:px-20 xl:px-20 py-2 w-full">
        <div className="w-full max-w-8xl mx-auto">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex -translate-x-4 items-start gap-2 w-[200px]">
              {settings?.logo ? (
                <Image
                  src={settings.logo}
                  alt={settings.siteName || "Logo"}
                  width={200}
                  height={200}
                  className="rounded-md object-cover h-10"
                />
              ) : (
                <span className="text-2xl font-extrabold text-gray-800 dark:text-white">
                  <span className="text-green-600">Shop</span>Ease
                </span>
              )}
            </Link>

            {/* Search */}
            <div
              className="relative hidden md:flex flex-1 mx-4 max-w-md"
              ref={searchRef}
            >
              <form onSubmit={handleSubmit} className="w-full">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="rounded-full px-4"
                />
              </form>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 rounded-lg shadow-md mt-1 z-50">
                  {suggestions.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => handleSuggestionClick(item._id)}
                      className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span>{item.title}</span>
                      <span className="text-green-600 font-semibold text-sm">
                        ₦{Number(item.price).toLocaleString()}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-5">
              <Link href="/products" className="hover:text-green-600">
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
                  <div className="absolute mt-8 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 z-50 max-h-64 overflow-auto">
                    {catsLoading ? (
                      <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
                    ) : categories.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500">No categories</div>
                    ) : (
                      categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/category/${encodeURIComponent(cat.id)}`}
                          className="block px-4 py-2 hover:bg-gray-100 hover:text-gray-500"
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
                  <div className="absolute mt-8 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 z-50">
                    <Link
                      href="/about"
                      className="block px-4 py-2 hover:bg-gray-100 hover:text-gray-500"
                      onClick={() => setPagesOpen(false)}
                    >
                      About Us
                    </Link>
                    <Link
                      href="/contact"
                      className="block px-4 py-2 hover:bg-gray-100 hover:text-gray-500"
                      onClick={() => setPagesOpen(false)}
                    >
                      Contact Us
                    </Link>
                    <Link
                      href="/faq"
                      className="block px-4 py-2 hover:bg-gray-100 hover:text-gray-500"
                      onClick={() => setPagesOpen(false)}
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
                  <div className="absolute mt-8 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 z-50">
                    <Link
                      href="/blog"
                      className="block px-4 py-2 hover:bg-gray-100 hover:text-gray-500"
                      onClick={() => setBlogOpen(false)}
                    >
                      All Posts
                    </Link>
                    <Link
                      href="/blog/latest"
                      className="block px-4 py-2 hover:bg-gray-100 hover:text-gray-500"
                      onClick={() => setBlogOpen(false)}
                    >
                      Latest
                    </Link>
                    <Link
                      href="/blog/popular"
                      className="block px-4 py-2 hover:bg-gray-100 hover:text-gray-500"
                      onClick={() => setBlogOpen(false)}
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
                    router.push("/auth/login");
                    toast.warning("Please login to access your wishlist");
                    return;
                  }
                  router.push("/user/wishlist");
                }}
                className="hover:text-green-600"
              >
                <Heart className="w-6 h-6" />
              </button>

              {/* Cart */}
              <Link href="/cart" className="relative hover:text-green-600">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              <div className="relative" ref={dropdownRef}>
                {session?.user ? (
                  <>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center space-x-2 hover:text-green-600"
                    >
                      <User className="w-5 h-5" />
                      <span className="hidden sm:block">{session.user.name}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-8 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 z-50">
                        <Link
                          href="/user/profile"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <User className="w-4 h-4 text-green-600" /> My Profile
                        </Link>
                        <Link
                          href="/user/orders"
                          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FileText className="w-4 h-4 text-green-600" /> My Orders
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded w-full text-left"
                        >
                          Logout
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="hover:text-green-600 mr-5 hidden md:block"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <ChevronDown className="h-6 w-6" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[80%] sm:w-[60%] bg-white dark:bg-gray-900 flex flex-col">
                <SheetHeader className="p-4 py-6 border-b">
                  {/* <SheetTitle className="text-lg font-semibold">Menu</SheetTitle> */}
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



// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useSession, signOut } from "next-auth/react";
// import { useState, useEffect, useRef } from "react";
// import {
//   Box,
//   Grid,
//   FileText,
//   ShoppingCart,
//   User,
//   ChevronDown,
//   Heart,
// } from "lucide-react";
// import { toast, Toaster } from "sonner";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
//   SheetClose,
// } from "@/components/ui/sheet";
// import {
//   Accordion,
//   AccordionItem,
//   AccordionTrigger,
//   AccordionContent,
// } from "@/components/ui/accordion";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useSettings } from "@/contexts/SettingsContext";
// import Image from "next/image";
// import { useCart } from "@/hooks/useCart";

// export default function Navbar() {
//   const { data: session } = useSession();
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [categoriesOpen, setCategoriesOpen] = useState(false);
//   const [pagesOpen, setPagesOpen] = useState(false);
//   const [blogOpen, setBlogOpen] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [suggestions, setSuggestions] = useState<any[]>([]);
//   const [showSuggestions, setShowSuggestions] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const searchRef = useRef<HTMLDivElement>(null);
//   const categoriesRef = useRef<HTMLDivElement>(null);
//   const pagesRef = useRef<HTMLDivElement>(null);
//   const blogRef = useRef<HTMLDivElement>(null);
//   const router = useRouter();
//   const { settings } = useSettings();
//   const { data: cart } = useCart();
//   const cartCount =
//     cart?.items?.reduce(
//       (sum: number, item: { quantity: number }) => sum + item.quantity,
//       0
//     ) || 0;

//   // Categories state
//   const [categories, setCategories] = useState<string[]>([]);
//   const [catsLoading, setCatsLoading] = useState(false);

//   // Fetch search suggestions
//   useEffect(() => {
//     const fetchSuggestions = async () => {
//       if (searchQuery.trim().length < 2) {
//         setSuggestions([]);
//         return;
//       }
//       try {
//         const res = await fetch(
//           `/api/products/search?q=${encodeURIComponent(searchQuery)}`
//         );
//         const data = await res.json();
//         setSuggestions(data);
//         setShowSuggestions(true);
//       } catch {
//         toast.error("Failed to fetch suggestions");
//       }
//     };
//     const timer = setTimeout(fetchSuggestions, 300);
//     return () => clearTimeout(timer);
//   }, [searchQuery]);

//   // Fetch categories once
//   useEffect(() => {
//     let mounted = true;
//     const loadCategories = async () => {
//       setCatsLoading(true);
//       try {
//         const res = await fetch("/api/categories");
//         if (!res.ok) throw new Error("Failed to fetch categories");
//         const data = await res.json();
//         if (mounted && Array.isArray(data.categories)) {
//           const cleaned = data.categories
//             .filter((c: any) => typeof c === "string" && c.trim() !== "")
//             .map((c: string) => c.trim());
//           setCategories(Array.from(new Set(cleaned)));
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         if (mounted) setCatsLoading(false);
//       }
//     };
//     loadCategories();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       // User dropdown
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node))
//         setDropdownOpen(false);

//       // Search suggestions
//       if (searchRef.current && !searchRef.current.contains(event.target as Node))
//         setShowSuggestions(false);

//       // Categories dropdown
//       if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node))
//         setCategoriesOpen(false);

//       // Pages dropdown
//       if (pagesRef.current && !pagesRef.current.contains(event.target as Node))
//         setPagesOpen(false);

//       // Blog dropdown
//       if (blogRef.current && !blogRef.current.contains(event.target as Node))
//         setBlogOpen(false);
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!searchQuery.trim()) {
//       toast.warning("Please enter a product name");
//       return;
//     }
//     router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
//     setShowSuggestions(false);
//     setSearchQuery("");
//   };

//   const handleSuggestionClick = (_id: string) => {
//     router.push(`/products/${_id}`);
//     setSearchQuery("");
//     setShowSuggestions(false);
//   };

//   const handleLogout = async () => {
//     await signOut({ callbackUrl: "/" });
//     toast.success("Logged out successfully");
//   };

//   return (
//     <>
//       <Toaster richColors position="top-right" />
//       <nav className="bg-white/80 backdrop-blur-md shadow-sm dark:bg-gray-900 sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition px-6 lg:px-20 xl:px-20 py-2 w-full">
//         <div className="w-full max-w-8xl mx-auto">
//           <div className="flex justify-between items-center h-16">
//             {/* Logo */}
//             <Link href="/" className="flex items-start gap-2 w-[200px]">
//               {settings?.logo ? (
//                 <Image
//                   src={settings.logo}
//                   alt={settings.siteName || "Logo"}
//                   width={200}
//                   height={200}
//                   className="rounded-md object-cover h-10"
//                 />
//               ) : (
//                 <span className="text-2xl font-extrabold text-gray-800 dark:text-white">
//                   <span className="text-green-600">Shop</span>Ease
//                 </span>
//               )}
//             </Link>

//             {/* Search */}
//             <div
//               className="relative hidden md:flex flex-1 mx-4 max-w-md"
//               ref={searchRef}
//             >
//               <form onSubmit={handleSubmit} className="w-full">
//                 <Input
//                   type="text"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   placeholder="Search for products..."
//                   className="rounded-full px-4"
//                 />
//               </form>
//               {showSuggestions && suggestions.length > 0 && (
//                 <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 rounded-lg shadow-md mt-1 z-50">
//                   {suggestions.map((item) => (
//                     <button
//                       key={item._id}
//                       onClick={() => handleSuggestionClick(item._id)}
//                       className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
//                     >
//                       <span>{item.title}</span>
//                       <span className="text-green-600 font-semibold text-sm">
//                         ₦{Number(item.price).toLocaleString()}
//                       </span>
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Desktop menu */}
//             <div className="hidden md:flex items-center space-x-5">
//               <Link href="/products" className="hover:text-green-600">
//                 Marketplace
//               </Link>

//               {/* Categories */}
//               <div className="relative" ref={categoriesRef}>
//                 <button
//                   onClick={() => setCategoriesOpen(!categoriesOpen)}
//                   className="flex items-center gap-1 hover:text-green-600"
//                 >
//                   Categories <ChevronDown className="w-4 h-4" />
//                 </button>
//                 {categoriesOpen && (
//                   <div className="absolute mt-8 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 z-50 max-h-64 overflow-auto">
//                     {catsLoading ? (
//                       <div className="px-4 py-2 text-sm text-gray-500">Loading...</div>
//                     ) : categories.length === 0 ? (
//                       <div className="px-4 py-2 text-sm text-gray-500">No categories</div>
//                     ) : (
//                       categories.map((cat) => (
//                         <Link
//                           key={cat.id}
//                           href={`/category/${encodeURIComponent(cat)}`}
//                           className="block px-4 py-2 hover:bg-gray-100 hover:text-gray-500"
//                           onClick={() => setCategoriesOpen(false)} // closes dropdown on link click
//                         >
//                           {cat}
//                         </Link>
//                       ))
//                     )}
//                   </div>
//                 )}
//               </div>

//               {/* Pages */}
//               <div className="relative" ref={pagesRef}>
//                 <button
//                   onClick={() => setPagesOpen(!pagesOpen)}
//                   className="flex items-center gap-1 hover:text-green-600"
//                 >
//                   Pages <ChevronDown className="w-4 h-4" />
//                 </button>
//                 {pagesOpen && (
//                   <div className="absolute mt-8 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 z-50">
//                     <Link href="/about" className="block px-4 py-2 hover:bg-gray-100 hover:text-gray-500" onClick={() => setPagesOpen(false)}>About Us</Link>
//                     <Link href="/contact" className="block px-4 py-2 hover:bg-gray-100 hover:text-gray-500" onClick={() => setPagesOpen(false)}>Contact Us</Link>
//                     <Link href="/faq" className="block px-4 py-2 hover:bg-gray-100 hover:text-gray-500" onClick={() => setPagesOpen(false)}>FAQ / Help</Link>
//                   </div>
//                 )}
//               </div>

//               {/* Blog */}
//               <div className="relative" ref={blogRef}>
//                 <button
//                   onClick={() => setBlogOpen(!blogOpen)}
//                   className="flex items-center gap-1 hover:text-green-600"
//                 >
//                   Blog <ChevronDown className="w-4 h-4" />
//                 </button>
//                 {blogOpen && (
//                   <div className="absolute mt-8 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg py-2 z-50">
//                     <Link href="/blog" className="block px-4 py-2 hover:bg-gray-100 hover:text-gray-500" onClick={() => setBlogOpen(false)}>All Posts</Link>
//                     <Link href="/blog/latest" className="block px-4 py-2 hover:bg-gray-100 hover:text-gray-500" onClick={() => setBlogOpen(false)}>Latest</Link>
//                     <Link href="/blog/popular" className="block px-4 py-2 hover:bg-gray-100 hover:text-gray-500" onClick={() => setBlogOpen(false)}>Popular</Link>
//                   </div>
//                 )}
//               </div>


//               <button
//                 onClick={() => {
//                   if (!session?.user) {
//                     router.push("/auth/login");
//                     toast.warning("Please login to access your wishlist");
//                     return;
//                   }
//                   router.push("/user/wishlist");
//                 }}
//                 className="hover:text-green-600"
//               >
//                 <Heart className="w-6 h-6" />
//               </button>


//               <Link href="/cart" className="relative hover:text-green-600">
//                 <ShoppingCart className="w-6 h-6" />
//                 {cartCount > 0 && (
//                   <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                     {cartCount}
//                   </span>
//                 )}
//               </Link>
//             </div>

//             {/* User menu */}
//             <div className="relative" ref={dropdownRef}>
//               {session?.user ? (
//                 <>
//                   <button
//                     onClick={() => setDropdownOpen(!dropdownOpen)}
//                     className="flex items-center space-x-2 hover:text-green-600"
//                   >
//                     <User className="w-5 h-5" />
//                     <span className="hidden sm:block">{session.user.name}</span>
//                     <ChevronDown className="w-4 h-4" />
//                   </button>
//                   {dropdownOpen && (
//                     <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
//                       <Link href="/user/profile" className="block px-4 py-2 hover:bg-gray-100">
//                         My Profile
//                       </Link>
//                       <Link href="/user/orders" className="block px-4 py-2 hover:bg-gray-100">
//                         My Orders
//                       </Link>
//                       <button
//                         onClick={handleLogout}
//                         className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
//                       >
//                         Logout
//                       </button>
//                     </div>
//                   )}
//                 </>
//               ) : (
//                 <Link href="/auth/login" className="hover:text-green-600 mr-5 hidden md:block">
//                   Login
//                 </Link>
//               )}
//             </div>

//             {/* Mobile sheet */}
//             <Sheet>
//               <SheetTrigger asChild>
//                 <Button variant="ghost" size="icon" className="md:hidden">
//                   <ChevronDown className="h-6 w-6" />
//                 </Button>
//               </SheetTrigger>

//               <SheetContent side="right" className="w-[80%] sm:w-[60%] bg-white dark:bg-gray-900 flex flex-col">
//                 <SheetHeader className="p-4 border-b">
//                   <SheetTitle className="text-lg font-semibold">Menu</SheetTitle>
//                 </SheetHeader>

//                 <div className="flex flex-col p-4 space-y-3 text-sm">
//                   {/* Products */}
//                   <SheetClose asChild>
//                     <Link href="/products" className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded">
//                       <Box className="w-5 h-5 text-green-600" /> Products
//                     </Link>
//                   </SheetClose>

//                   {/* Categories Accordion */}
//                   <Accordion type="single" collapsible className="w-full">
//                     <AccordionItem value="categories">
//                       <AccordionTrigger className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded w-full">
//                         <Grid className="w-5 h-5 text-green-600" /> Categories
//                       </AccordionTrigger>
//                       <AccordionContent className="flex flex-col pl-8 pt-2 space-y-1">
//                         {catsLoading ? (
//                           <div className="text-gray-500 text-sm">Loading...</div>
//                         ) : categories.length === 0 ? (
//                           <div className="text-gray-500 text-sm">No categories</div>
//                         ) : (
//                           categories.map((cat) => (
//                             <SheetClose asChild key={cat}>
//                               <Link
//                                 href={`/category/${encodeURIComponent(cat)}`}
//                                 className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded text-sm"
//                               >
//                                 <Grid className="w-4 h-4 text-green-500" />
//                                 {cat}
//                               </Link>
//                             </SheetClose>
//                           ))
//                         )}
//                       </AccordionContent>
//                     </AccordionItem>
//                   </Accordion>

//                   {/* Pages Accordion */}
//                   <Accordion type="single" collapsible className="w-full">
//                     <AccordionItem value="pages">
//                       <AccordionTrigger className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded w-full">
//                         <FileText className="w-5 h-5 text-green-600" /> Pages
//                       </AccordionTrigger>
//                       <AccordionContent className="flex flex-col pl-8 pt-2 space-y-1">
//                         <SheetClose asChild>
//                           <Link href="/about" className="flex items-center gap-2 py-1 hover:bg-gray-100 rounded text-sm">
//                             <FileText className="w-4 h-4 text-green-500" /> About Us
//                           </Link>
//                         </SheetClose>
//                         <SheetClose asChild>
//                           <Link href="/contact" className="flex items-center gap-2 py-1 hover:bg-gray-100 rounded text-sm">
//                             <FileText className="w-4 h-4 text-green-500" /> Contact Us
//                           </Link>
//                         </SheetClose>
//                         <SheetClose asChild>
//                           <Link href="/faq" className="flex items-center gap-2 py-1 hover:bg-gray-100 rounded text-sm">
//                             <FileText className="w-4 h-4 text-green-500" /> FAQ / Help
//                           </Link>
//                         </SheetClose>
//                       </AccordionContent>
//                     </AccordionItem>
//                   </Accordion>

//                   {/* Blog Accordion */}
//                   <Accordion type="single" collapsible className="w-full">
//                     <AccordionItem value="blog">
//                       <AccordionTrigger className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded w-full">
//                         <FileText className="w-5 h-5 text-green-600" /> Blog
//                       </AccordionTrigger>
//                       <AccordionContent className="flex flex-col pl-8 pt-2 space-y-1">
//                         <SheetClose asChild>
//                           <Link href="/blog" className="flex items-center gap-2 py-1 hover:bg-gray-100 rounded text-sm">
//                             <FileText className="w-4 h-4 text-green-500" /> All Posts
//                           </Link>
//                         </SheetClose>
//                         <SheetClose asChild>
//                           <Link href="/blog/latest" className="flex items-center gap-2 py-1 hover:bg-gray-100 rounded text-sm">
//                             <FileText className="w-4 h-4 text-green-500" /> Latest
//                           </Link>
//                         </SheetClose>
//                         <SheetClose asChild>
//                           <Link href="/blog/popular" className="flex items-center gap-2 py-1 hover:bg-gray-100 rounded text-sm">
//                             <FileText className="w-4 h-4 text-green-500" /> Popular
//                           </Link>
//                         </SheetClose>
//                       </AccordionContent>
//                     </AccordionItem>
//                   </Accordion>

//                   {/* Cart */}
//                   <SheetClose asChild>
//                     <Link href="/cart" className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded text-sm">
//                       <ShoppingCart className="w-5 h-5 text-green-600" /> Cart
//                       {cartCount > 0 && (
//                         <span className="ml-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                           {cartCount}
//                         </span>
//                       )}
//                     </Link>
//                   </SheetClose>

//                   {/* User / Auth */}
//                   {session?.user ? (
//                     <>
//                       <SheetClose asChild>
//                         <Link href="/user/profile" className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded text-sm">
//                           <User className="w-5 h-5 text-green-600" /> My Profile
//                         </Link>
//                       </SheetClose>
//                       <SheetClose asChild>
//                         <Link href="/user/orders" className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded text-sm">
//                           <FileText className="w-5 h-5 text-green-600" /> My Orders
//                         </Link>
//                       </SheetClose>
//                       <SheetClose asChild>
//                         <button
//                           onClick={handleLogout}
//                           className="flex items-center gap-2 py-2 text-red-600 hover:bg-gray-100 rounded text-sm"
//                         >
//                           Logout
//                         </button>
//                       </SheetClose>
//                     </>
//                   ) : (
//                     <SheetClose asChild>
//                       <Link href="/auth/login" className="flex items-center gap-2 py-2 hover:bg-gray-100 rounded text-sm">
//                         <User className="w-5 h-5 text-green-600" /> Login
//                       </Link>
//                     </SheetClose>
//                   )}
//                 </div>
//               </SheetContent>
//             </Sheet>
//           </div>
//         </div>
//       </nav>
//     </>
//   );
// }
