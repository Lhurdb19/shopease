"use client";


import Image from "next/image";
import { IProduct } from "@/models/Product";
import { useState } from "react";


export default function ThumbnailSlider({ images }: { images: string[] }) {
const [active, setActive] = useState(0);
if (!images || images.length === 0) images = ['/placeholder.png'];


return (
<div className="w-full">
<div className="flex justify-center">
<div className="relative" style={{ width: 400, maxWidth: '100%' }}>
<Image src={images[active]} alt={`img-${active}`} width={400} height={300} className="object-cover rounded-md" />
</div>
</div>


<div className="mt-3 flex gap-2 overflow-auto px-1">
{images.map((src, i) => (
<button key={i} onClick={() => setActive(i)} className={`w-20 h-14 rounded overflow-hidden flex-shrink-0 border ${i === active ? 'ring-2 ring-green-500' : 'ring-0'}`}>
<Image src={src} alt={`thumb-${i}`} width={80} height={60} className="object-cover" />
</button>
))}
</div>
</div>
);
}