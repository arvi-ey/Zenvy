"use client"

import React, { useState, useEffect, useCallback } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Heart,
    Share2,
    Truck,
    RefreshCw,
    ShieldCheck,
    Star,
    Minus,
    Plus,
    ShoppingBag
} from 'lucide-react';

import { useParams } from 'next/navigation';
import useProducts from '@/hooks/useProducts';


interface ProductImage {
    url: string;
    is_main: boolean;
}

interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    category_id: number;
    price: string;
    status: 'active' | 'inactive' | 'draft';
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
    stock: string;
    is_featured: boolean;
    images: ProductImage[];
}

interface SkeletonBlockProps {
    className?: string;
}

interface StarRatingProps {
    rating?: number;
    count?: number;
}

interface ThumbnailGalleryProps {
    images: ProductImage[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}

interface QuantitySelectorProps {
    value: number;
    onChange: (value: number) => void;
    max?: number;
}

interface SizeSelectorProps {
    selected: string;
    onSelect: (size: string) => void;
}


const MOCK_PRODUCT: Product = {
    id: 271,
    name: "Grey Textured Stripes Shirt",
    slug: "grey-textured-stripes-shirt-e3454abe",
    description: "Maintain a timeless look as you transition between smart and casual in timeless style with snitch's new season collection of men's shirts. No matter what your style is, you need this half sleeve box fit shirt in your wardrobe. It is made from 100% polyester and features a roomy cut for a casual style.",
    category_id: 23,
    price: "699MOCK_PRODUCT.00",
    status: "active",
    created_at: "2026-09-05T07:03:24.650Z",
    updated_at: "2026-09-10T16:05:48.643Z",
    deleted_at: null,
    stock: "57",
    is_featured: false,
    images: [
        {
            url: "https://www.snitch.co.in/cdn/shop/files/295014313658542e3afc806877753ff2.jpg?v=1731388711&width=1800",
            is_main: true
        },
        {
            url: "https://www.snitch.co.in/cdn/shop/files/983fe8e27a1aacdb3edcde42a6a02ea7.jpg?v=1731388711&width=1800",
            is_main: false
        },
        {
            url: "https://www.snitch.co.in/cdn/shop/files/42fd58682cd2425853cf0c2855d66d61.jpg?v=1731388711&width=1800",
            is_main: false
        }
    ]
};

// ─── Skeleton Components ──────────────────────────────────────────────────────
const SkeletonBlock: React.FC<SkeletonBlockProps> = ({ className = '' }) => (
    <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
);

const ProductDetailSkeleton: React.FC = () => (
    <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Breadcrumb skeleton */}
            <div className="mb-8 flex gap-2">
                <SkeletonBlock className="h-4 w-16" />
                <SkeletonBlock className="h-4 w-4" />
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-4" />
                <SkeletonBlock className="h-4 w-32" />
            </div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
                {/* Left – Image Gallery Skeleton */}
                <div className="flex flex-col-reverse gap-4 sm:flex-row">
                    {/* Thumbnails */}
                    <div className="flex flex-row gap-3 sm:flex-col">
                        {[1, 2, 3].map((i) => (
                            <SkeletonBlock key={i} className="h-20 w-20 shrink-0 rounded-xl sm:h-24 sm:w-24" />
                        ))}
                    </div>
                    {/* Main Image */}
                    <SkeletonBlock className="aspect-[4/5] w-full flex-1 rounded-2xl" />
                </div>

                {/* Right – Product Info Skeleton */}
                <div className="flex flex-col gap-6">
                    <div>
                        <SkeletonBlock className="mb-3 h-4 w-24" />
                        <SkeletonBlock className="mb-2 h-9 w-3/4" />
                        <SkeletonBlock className="h-5 w-32" />
                    </div>
                    <div className="flex items-center gap-4">
                        <SkeletonBlock className="h-8 w-24" />
                        <SkeletonBlock className="h-5 w-20" />
                    </div>
                    <SkeletonBlock className="h-px w-full" />
                    <div className="space-y-3">
                        <SkeletonBlock className="h-4 w-full" />
                        <SkeletonBlock className="h-4 w-5/6" />
                        <SkeletonBlock className="h-4 w-4/6" />
                    </div>
                    <div className="flex gap-3">
                        <SkeletonBlock className="h-12 w-12 rounded-xl" />
                        <SkeletonBlock className="h-12 w-12 rounded-xl" />
                        <SkeletonBlock className="h-12 w-12 rounded-xl" />
                    </div>
                    <SkeletonBlock className="h-12 w-full rounded-xl" />
                    <div className="flex gap-4">
                        <SkeletonBlock className="h-14 flex-1 rounded-xl" />
                        <SkeletonBlock className="h-14 flex-1 rounded-xl" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// ─── Star Rating Component ───────────────────────────────────────────────────
const StarRating: React.FC<StarRatingProps> = ({ rating = 4.5, count = 128 }) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => {
                    if (i < fullStars) {
                        return <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />;
                    }
                    if (i === fullStars && hasHalf) {
                        return (
                            <div key={i} className="relative">
                                <Star className="h-4 w-4 text-muted-foreground/30" />
                                <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                </div>
                            </div>
                        );
                    }
                    return <Star key={i} className="h-4 w-4 text-muted-foreground/30" />;
                })}
            </div>
            <span className="text-sm font-medium text-foreground">{rating}</span>
            <span className="text-sm text-muted-foreground">({count} reviews)</span>
        </div>
    );
};


const ThumbnailGallery: React.FC<ThumbnailGalleryProps> = ({ images, selectedIndex, onSelect }) => (
    <div className="flex flex-row gap-3 sm:flex-col">
        {images.map((image, index) => (
            <button
                key={image.url}
                type="button"
                onClick={() => onSelect(index)}
                aria-label={`View image ${index + 1}`}
                className={`
                    group relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200
                    sm:h-24 sm:w-24
                    ${selectedIndex === index
                        ? 'border-primary ring-2 ring-primary/20 ring-offset-2'
                        : 'border-transparent hover:border-muted-foreground/30'
                    }
                `}
            >
                <img
                    src={image.url}
                    alt={`Product thumbnail ${index + 1}`}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                />
                {image.is_main && (
                    <span className="absolute bottom-0 left-0 right-0 bg-primary/90 py-0.5 text-center text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                        Main
                    </span>
                )}
            </button>
        ))}
    </div>
);


const QuantitySelector: React.FC<QuantitySelectorProps> = ({ value, onChange, max = 99 }) => (
    <div className="flex items-center rounded-xl border border-input bg-background">
        <button
            type="button"
            onClick={() => onChange(Math.max(1, value - 1))}
            disabled={value <= 1}
            className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
            aria-label="Decrease quantity"
        >
            <Minus className="h-4 w-4" />
        </button>
        <span className="flex h-12 w-12 items-center justify-center text-sm font-semibold tabular-nums">
            {value}
        </span>
        <button
            type="button"
            onClick={() => onChange(Math.min(max, value + 1))}
            disabled={value >= max}
            className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
            aria-label="Increase quantity"
        >
            <Plus className="h-4 w-4" />
        </button>
    </div>
);


const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;

const SizeSelector: React.FC<SizeSelectorProps> = ({ selected, onSelect }) => (
    <div>
        <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Size</span>
            <button
                type="button"
                className="text-xs font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground"
            >
                Size Guide
            </button>
        </div>
        <div className="flex flex-wrap gap-2.5">
            {SIZE_OPTIONS.map((size) => (
                <button
                    key={size}
                    type="button"
                    onClick={() => onSelect(size)}
                    className={`
                        flex h-11 min-w-[3rem] items-center justify-center rounded-xl border text-sm font-medium transition-all duration-200
                        ${selected === size
                            ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                            : 'border-input bg-background text-foreground hover:border-foreground/40'
                        }
                    `}
                >
                    {size}
                </button>
            ))}
        </div>
    </div>
);


const ProductDetailPage: React.FC = () => {
    // console.log("🔥 PRODUCT DETAIL COMPONENT RENDERED");
    const { getProductDetails, productsLoading } = useProducts()
    const [loading, setLoading] = useState<boolean>(true);
    const [product, setProduct] = useState<Product | null>(null);
    const [selectedImage, setSelectedImage] = useState<number>(0);
    const [selectedSize, setSelectedSize] = useState<string>('M');
    const [quantity, setQuantity] = useState<number>(1);
    const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
    const params = useParams()
    console.log(params, "Params")



    useEffect(() => {
        console.log("🔥 EFFECT RUNNING");
        console.log("🔥 PARAMS:", params);
        console.log("🔥 SLUG:", params.slug);
    }, []);

    useEffect(() => {
        const getDetails = async () => {
            console.log(params.slug, "PARAMS SLUG")
            if (!params.slug) return
            const data = await getProductDetails(params.slug)
            if (data) setProduct(data)
        }
        getDetails()
    }, [params]);

    console.log(product, "Product")


    const goToPrev = useCallback(() => {
        if (!product) return;
        setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    }, [product]);

    const goToNext = useCallback(() => {
        if (!product) return;
        setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
    }, [product]);


    useEffect(() => {
        if (loading || !product) return;

        const handleKeyDown = (e: KeyboardEvent): void => {
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'ArrowRight') goToNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [loading, product, goToPrev, goToNext]);

    if (productsLoading && !product) return <ProductDetailSkeleton />;

    const mainImage = product?.images[selectedImage];
    const price = parseFloat(product?.price);
    const originalPrice = price * 1.6; // Mock original price for discount display
    const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
    const stockCount = parseInt(product?.stock, 10);
    const inStock = stockCount > 0;

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* ── Breadcrumb ─────────────────────────────────────────────── */}
                <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
                    <a href="/" className="transition-colors hover:text-foreground">Home</a>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <a href="/men" className="transition-colors hover:text-foreground">Men</a>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <a href="/men/shirts" className="transition-colors hover:text-foreground">Shirts</a>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="truncate font-medium text-foreground">{product?.name}</span>
                </nav>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
                    {/* ── Left Column: Image Gallery ───────────────────────────── */}
                    <div className="flex flex-col-reverse gap-4 sm:flex-row">
                        {/* Thumbnails */}
                        <ThumbnailGallery
                            images={product?.images}
                            selectedIndex={selectedImage}
                            onSelect={setSelectedImage}
                        />

                        {/* Main Image */}
                        <div className="group relative aspect-[4/5] w-full flex-1 overflow-hidden rounded-2xl bg-muted">
                            <img
                                key={mainImage?.url}
                                src={mainImage?.url}
                                alt={product?.name}
                                className="h-full w-full object-cover transition-all duration-500 ease-out"
                            />

                            {/* Navigation Arrows */}
                            {product.images.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={goToPrev}
                                        aria-label="Previous image"
                                        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-background group-hover:opacity-100"
                                    >
                                        <ChevronLeft className="h-5 w-5" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={goToNext}
                                        aria-label="Next image"
                                        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 text-foreground opacity-0 shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-background group-hover:opacity-100"
                                    >
                                        <ChevronRight className="h-5 w-5" />
                                    </button>
                                </>
                            )}

                            {/* Badges */}
                            <div className="absolute left-4 top-4 flex flex-col gap-2">
                                {discountPercent > 0 && (
                                    <span className="rounded-full bg-destructive px-3 py-1 text-xs font-bold uppercase tracking-wider text-destructive-foreground shadow-sm">
                                        {discountPercent}% OFF
                                    </span>
                                )}
                                {product.is_featured && (
                                    <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                                        Featured
                                    </span>
                                )}
                            </div>

                            {/* Image counter */}
                            <div className="absolute bottom-4 right-4 rounded-full bg-background/80 px-3 py-1 text-xs font-medium tabular-nums text-foreground backdrop-blur-sm">
                                {selectedImage + 1} / {product.images.length}
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column: Product Info ───────────────────────────── */}
                    <div className="flex flex-col gap-6">
                        {/* Title & Rating */}
                        <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                                Snitch Collection
                            </p>
                            <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
                                {product.name}
                            </h1>
                            <div className="mt-3">
                                <StarRating rating={4.5} count={128} />
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold tracking-tight text-foreground">
                                ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                            </span>
                            <span className="text-lg text-muted-foreground line-through">
                                ₹{originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                            </span>
                            <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Save {discountPercent}%
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-border" />

                        {/* Description */}
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {product.description}
                        </p>

                        {/* Size Selector */}
                        <SizeSelector selected={selectedSize} onSelect={setSelectedSize} />

                        {/* Quantity & Stock */}
                        <div>
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">Quantity</span>
                                {inStock ? (
                                    <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                                        </span>
                                        In Stock ({product.stock} left)
                                    </span>
                                ) : (
                                    <span className="text-xs font-medium text-destructive">Out of Stock</span>
                                )}
                            </div>
                            <div className="flex items-center gap-4">
                                <QuantitySelector value={quantity} onChange={setQuantity} max={stockCount} />
                                <span className="text-sm text-muted-foreground">
                                    Subtotal:{' '}
                                    <span className="font-semibold text-foreground">
                                        ₹{(price * quantity).toLocaleString('en-IN')}
                                    </span>
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                disabled={!inStock}
                                className="group relative flex h-14 flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-xl hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ShoppingBag className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                                Add to Cart
                            </button>
                            <button
                                type="button"
                                disabled={!inStock}
                                className="flex h-14 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-primary bg-transparent text-sm font-semibold text-primary transition-all duration-300 hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Buy Now
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsWishlisted(!isWishlisted)}
                                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                                className={`flex h-14 w-14 items-center justify-center rounded-xl border transition-all duration-300 ${isWishlisted
                                    ? 'border-destructive bg-destructive/10 text-destructive'
                                    : 'border-input text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                                    }`}
                            >
                                <Heart
                                    className={`h-5 w-5 transition-transform duration-300 ${isWishlisted ? 'scale-110 fill-current' : ''
                                        }`}
                                />
                            </button>
                            <button
                                type="button"
                                aria-label="Share product"
                                className="flex h-14 w-14 items-center justify-center rounded-xl border border-input text-muted-foreground transition-all duration-300 hover:border-foreground/30 hover:text-foreground"
                            >
                                <Share2 className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-3 rounded-2xl border border-border bg-muted/40 p-4">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <Truck className="h-5 w-5 text-muted-foreground" />
                                <span className="text-[11px] font-medium leading-tight text-muted-foreground">
                                    Free Shipping<br />over ₹999
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <RefreshCw className="h-5 w-5 text-muted-foreground" />
                                <span className="text-[11px] font-medium leading-tight text-muted-foreground">
                                    7-Day<br />Easy Returns
                                </span>
                            </div>
                            <div className="flex flex-col items-center gap-2 text-center">
                                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                                <span className="text-[11px] font-medium leading-tight text-muted-foreground">
                                    100%<br />Secure Checkout
                                </span>
                            </div>
                        </div>

                        {/* Product Meta */}
                        <div className="space-y-1.5 text-xs text-muted-foreground">
                            <p>
                                <span className="font-medium text-foreground">SKU:</span> {product.slug}
                            </p>
                            <p>
                                <span className="font-medium text-foreground">Category:</span> Men&apos;s Shirts
                            </p>
                            <p>
                                <span className="font-medium text-foreground">Material:</span> 100% Polyester
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;