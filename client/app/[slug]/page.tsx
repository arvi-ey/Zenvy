"use client"

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
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
    ShoppingBag,
    PackageX,
} from 'lucide-react';

import { useParams } from 'next/navigation';
import useProducts from '@/hooks/useProducts';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProductImage {
    url: string;
    is_main: boolean;
}

interface ProductVariant {
    size: string;
    stock: number;
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
    stocks: ProductVariant[];
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const SkeletonBlock: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`animate-pulse rounded-lg bg-muted ${className}`} />
);

const ProductDetailSkeleton: React.FC = () => (
    <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8 flex gap-2">
                <SkeletonBlock className="h-4 w-16" />
                <SkeletonBlock className="h-4 w-4" />
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="h-4 w-4" />
                <SkeletonBlock className="h-4 w-32" />
            </div>
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
                <div className="flex flex-col-reverse gap-4 sm:flex-row">
                    <div className="flex flex-row gap-3 sm:flex-col">
                        {[1, 2, 3].map((i) => (
                            <SkeletonBlock key={i} className="h-20 w-20 shrink-0 rounded-xl sm:h-24 sm:w-24" />
                        ))}
                    </div>
                    <SkeletonBlock className="aspect-[4/5] w-full flex-1 rounded-2xl" />
                </div>
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

// ─── Not Found ────────────────────────────────────────────────────────────────
const ProductNotFound: React.FC = () => (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <PackageX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Product not found</h1>
            <p className="mt-2 text-sm text-muted-foreground">
                The product you're looking for doesn't exist or has been removed.
            </p>
            <Link
                href="/"
                className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-110"
            >
                Back to Home
            </Link>
        </div>
    </div>
);

// ─── Star Rating ──────────────────────────────────────────────────────────────
const StarRating: React.FC<{ rating?: number; count?: number }> = ({
    rating = 4.5,
    count = 128,
}) => {
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

// ─── Thumbnail Gallery ────────────────────────────────────────────────────────
const ThumbnailGallery: React.FC<{
    images: ProductImage[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}> = ({ images, selectedIndex, onSelect }) => (
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

// ─── Quantity Selector ────────────────────────────────────────────────────────
const QuantitySelector: React.FC<{
    value: number;
    onChange: (value: number) => void;
    max?: number;
}> = ({ value, onChange, max = 99 }) => {
    const upper = Math.max(1, max);
    return (
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
                onClick={() => onChange(Math.min(upper, value + 1))}
                disabled={value >= upper}
                className="flex h-12 w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
                aria-label="Increase quantity"
            >
                <Plus className="h-4 w-4" />
            </button>
        </div>
    );
};

const SizeSelector: React.FC<{
    variants: ProductVariant[];
    selected: string | null;
    onSelect: (size: string, stock: number) => void;
}> = ({ variants, selected, onSelect }) => {
    if (!variants?.length) return null;

    return (
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

            <div className="flex flex-wrap gap-3">
                {variants.map((variant) => {
                    const disabled = variant.stock === 0;
                    const isSelected = selected === variant.size;
                    const isLowStock = !disabled && variant.stock <= 5;

                    return (
                        <button
                            key={variant.size}
                            type="button"
                            disabled={disabled}
                            onClick={() => !disabled && onSelect(variant.size, variant.stock)}
                            aria-label={
                                disabled
                                    ? `${variant.size} — out of stock`
                                    : `${variant.size} — ${variant.stock} in stock`
                            }
                            aria-pressed={isSelected}
                            className={`
                                group relative flex h-14 min-w-[3.5rem] flex-col items-center justify-center
                                rounded-xl border px-3 text-sm font-semibold transition-all duration-200
                                ${isSelected
                                    ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                    : 'border-input bg-background text-foreground hover:border-foreground/40'
                                }
                                ${disabled
                                    ? 'cursor-not-allowed opacity-40 hover:border-input'
                                    : ''
                                }
                            `}
                        >
                            <span className={disabled ? 'line-through' : ''}>
                                {variant.size}
                            </span>

                            {/* Stock hint under size — fixed height to prevent layout shift */}
                            <span
                                className={`mt-0.5 text-[10px] font-medium leading-none ${isSelected
                                    ? 'text-primary-foreground/80'
                                    : isLowStock
                                        ? 'text-amber-600 dark:text-amber-400'
                                        : 'text-muted-foreground'
                                    }`}
                            >
                                {disabled
                                    ? 'out of stock'
                                    : isLowStock
                                        ? `${variant.stock} left`
                                        : `${variant.stock} in stock`
                                }
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ProductDetailPage: React.FC = () => {
    const { getProductDetails, productsLoading } = useProducts();
    const params = useParams();
    const slug = params.slug as string;

    const [product, setProduct] = useState<Product | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [availableStock, setavailableStock] = useState<number>()
    const [quantity, setQuantity] = useState(1);
    const [isWishlisted, setIsWishlisted] = useState(false);

    const inStock = true

    // Fetch product when slug changes

    useEffect(() => {
        console.log(selectedSize)

    }, [selectedSize])
    useEffect(() => {
        if (!slug) return;
        let cancelled = false;

        (async () => {
            setNotFound(false);
            const data = await getProductDetails(slug);
            if (cancelled) return;
            if (data) {
                setProduct(data);
                setSelectedImage(0);
                setQuantity(1);
            } else {
                setProduct(null);
                setNotFound(true);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug]);

    // Auto-select first in-stock variant when product loads
    useEffect(() => {
        if (!product?.stocks?.length) return;
        const firstInStock = product.stocks.find((v) => v.stock > 0);
        setSelectedSize(firstInStock?.size ?? product.stocks[0].size);
        setavailableStock(firstInStock?.stock ?? product.stocks[0].stock)

    }, [product]);

    const goToPrev = useCallback(() => {
        if (!product) return;
        setSelectedImage((prev) =>
            prev === 0 ? product.images.length - 1 : prev - 1
        );
    }, [product]);

    const goToNext = useCallback(() => {
        if (!product) return;
        setSelectedImage((prev) =>
            prev === product.images.length - 1 ? 0 : prev + 1
        );
    }, [product]);

    useEffect(() => {
        if (!product) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') goToPrev();
            if (e.key === 'ArrowRight') goToNext();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [product, goToPrev, goToNext]);

    // ─── Render states ────────────────────────────────────────────────────────
    if (productsLoading && !product) return <ProductDetailSkeleton />;
    if (notFound || !product) return <ProductNotFound />;




    const mainImage = product.images[selectedImage] ?? product.images[0];
    const price = parseFloat(product.price) || 0;
    const totalPrice = price * quantity;

    const handleSizeSelect = (size: string, stock: number) => {
        setSelectedSize(size)
        setavailableStock(stock)
        setQuantity(1);
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/" className="transition-colors hover:text-foreground">
                        Home
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <Link href="/men" className="transition-colors hover:text-foreground">
                        Men
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <Link href="/men/shirts" className="transition-colors hover:text-foreground">
                        Shirts
                    </Link>
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="truncate font-medium text-foreground">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
                    {/* ── Left: Image Gallery ──────────────────────────────── */}
                    <div className="flex flex-col-reverse gap-4 sm:flex-row">
                        <ThumbnailGallery
                            images={product.images}
                            selectedIndex={selectedImage}
                            onSelect={setSelectedImage}
                        />

                        <div className="group relative aspect-[4/5] w-full flex-1 overflow-hidden rounded-2xl bg-muted">
                            {mainImage ? (
                                <img
                                    key={mainImage.url}
                                    src={mainImage.url}
                                    alt={product.name}
                                    className="h-full w-full object-cover transition-all duration-500 ease-out"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                                    No image
                                </div>
                            )}

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

                            <div className="absolute left-4 top-4 flex flex-col gap-2">
                                {product.is_featured && (
                                    <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                                        Featured
                                    </span>
                                )}
                            </div>

                            {product.images.length > 0 && (
                                <div className="absolute bottom-4 right-4 rounded-full bg-background/80 px-3 py-1 text-xs font-medium tabular-nums text-foreground backdrop-blur-sm">
                                    {selectedImage + 1} / {product.images.length}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Right: Product Info ─────────────────────────────── */}
                    <div className="flex flex-col gap-6">
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

                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold tracking-tight text-foreground">
                                ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                            </span>
                        </div>

                        <div className="h-px w-full bg-border" />

                        <p className="text-sm leading-relaxed text-muted-foreground">
                            {product.description}
                        </p>

                        {product.stocks?.length > 0 && (
                            <SizeSelector
                                variants={product.stocks}
                                selected={selectedSize}
                                onSelect={handleSizeSelect}

                            />
                        )}

                        <div>

                            <div className="flex items-center gap-4">
                                <QuantitySelector
                                    value={quantity}
                                    onChange={setQuantity}
                                    max={availableStock || 1}
                                />
                                <span className="text-sm text-muted-foreground">
                                    Subtotal:{' '}
                                    <span className="font-semibold text-foreground">
                                        ₹{totalPrice.toLocaleString('en-IN')}
                                    </span>
                                </span>
                            </div>
                        </div>

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

                        <div className="space-y-1.5 text-xs text-muted-foreground">
                            <p>
                                <span className="font-medium text-foreground">SKU:</span> {product.slug}
                            </p>
                            <p>
                                <span className="font-medium text-foreground">Category ID:</span>{' '}
                                {product.category_id}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;