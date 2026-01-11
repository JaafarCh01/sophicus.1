import { clsx, type ClassValue } from "clsx";

/**
 * Merge class names with clsx
 */
export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

/**
 * Format currency with locale
 */
export function formatCurrency(
    amount: number,
    currency: string = "USD",
    locale: string = "en-US"
): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format large numbers (e.g., 1.2K, 1.5M)
 */
export function formatCompactNumber(num: number): string {
    return Intl.NumberFormat("en", { notation: "compact" }).format(num);
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
    if (text.length <= length) return text;
    return text.slice(0, length) + "...";
}

/**
 * Get lead score color based on value
 */
export function getScoreColor(score: number): string {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-brand";
    if (score >= 40) return "text-warning";
    return "text-danger";
}

/**
 * Get status badge class
 */
export function getStatusClass(status: string): string {
    const statusClasses: Record<string, string> = {
        new: "status-new",
        contacted: "status-contacted",
        qualified: "status-qualified",
        negotiation: "status-qualified",
        won: "status-won",
        lost: "status-lost",
        available: "status-new",
        pending: "status-contacted",
        sold: "status-won",
        off_market: "status-lost",
        pre_launch: "status-qualified",
    };
    return statusClasses[status] || "status-new";
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
