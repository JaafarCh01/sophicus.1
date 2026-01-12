"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

// Inline styles to ensure they work in Portal context
const STYLES = {
    colors: {
        bg: "#16161a",
        bgElevated: "#1e1e23",
        border: "#2d2d32",
        text: "#ededed",
        textMuted: "#9ca3af",
        brand: "#6366f1",
    },
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "2xl";
    showClose?: boolean;
}

const sizeMap = {
    sm: 384,
    md: 448,
    lg: 512,
    xl: 576,
    "2xl": 672,
};

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = "lg",
    showClose = true,
}: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!mounted) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 99999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 16,
                    }}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: "rgba(0, 0, 0, 0.75)",
                            backdropFilter: "blur(4px)",
                        }}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: "relative",
                            width: "100%",
                            maxWidth: sizeMap[size],
                            backgroundColor: STYLES.colors.bg,
                            borderRadius: 12,
                            border: `1px solid ${STYLES.colors.border}`,
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
                            color: STYLES.colors.text,
                            fontFamily: "system-ui, -apple-system, sans-serif",
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                justifyContent: "space-between",
                                padding: 20,
                                borderBottom: `1px solid ${STYLES.colors.border}`,
                            }}
                        >
                            <div style={{ flex: 1, paddingRight: 16 }}>
                                <h2
                                    style={{
                                        margin: 0,
                                        fontSize: 18,
                                        fontWeight: 600,
                                        color: STYLES.colors.text,
                                    }}
                                >
                                    {title}
                                </h2>
                                {description && (
                                    <p
                                        style={{
                                            margin: "4px 0 0 0",
                                            fontSize: 14,
                                            color: STYLES.colors.textMuted,
                                        }}
                                    >
                                        {description}
                                    </p>
                                )}
                            </div>
                            {showClose && (
                                <button
                                    onClick={onClose}
                                    style={{
                                        padding: 8,
                                        borderRadius: 8,
                                        border: "none",
                                        background: "transparent",
                                        cursor: "pointer",
                                        color: STYLES.colors.textMuted,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = STYLES.colors.bgElevated;
                                        e.currentTarget.style.color = STYLES.colors.text;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = "transparent";
                                        e.currentTarget.style.color = STYLES.colors.textMuted;
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <div style={{ padding: 20 }}>{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalContent, document.body);
}

interface SlideOverProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    width?: "sm" | "md" | "lg" | "xl";
}

const widthMap = {
    sm: 384,
    md: 448,
    lg: 512,
    xl: 576,
};

export function SlideOver({
    isOpen,
    onClose,
    title,
    children,
    width = "lg",
}: SlideOverProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    if (!mounted) return null;

    const slideOverContent = (
        <AnimatePresence>
            {isOpen && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 99999,
                    }}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: "absolute",
                            inset: 0,
                            backgroundColor: "rgba(0, 0, 0, 0.75)",
                            backdropFilter: "blur(4px)",
                        }}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        style={{
                            position: "absolute",
                            right: 0,
                            top: 0,
                            height: "100%",
                            width: "100%",
                            maxWidth: widthMap[width],
                            backgroundColor: STYLES.colors.bg,
                            borderLeft: `1px solid ${STYLES.colors.border}`,
                            boxShadow: "-10px 0 50px rgba(0, 0, 0, 0.5)",
                            overflowY: "auto",
                            color: STYLES.colors.text,
                            fontFamily: "system-ui, -apple-system, sans-serif",
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                position: "sticky",
                                top: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: 20,
                                borderBottom: `1px solid ${STYLES.colors.border}`,
                                backgroundColor: STYLES.colors.bg,
                                zIndex: 10,
                            }}
                        >
                            <h2
                                style={{
                                    margin: 0,
                                    fontSize: 18,
                                    fontWeight: 600,
                                    color: STYLES.colors.text,
                                }}
                            >
                                {title}
                            </h2>
                            <button
                                onClick={onClose}
                                style={{
                                    padding: 8,
                                    borderRadius: 8,
                                    border: "none",
                                    background: "transparent",
                                    cursor: "pointer",
                                    color: STYLES.colors.textMuted,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = STYLES.colors.bgElevated;
                                    e.currentTarget.style.color = STYLES.colors.text;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                    e.currentTarget.style.color = STYLES.colors.textMuted;
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ padding: 20 }}>{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(slideOverContent, document.body);
}

// Form components with inline styles for Portal usage
export const ModalInput = ({
    label,
    ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) => (
    <div style={{ marginBottom: 16 }}>
        {label && (
            <label
                style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 500,
                    color: STYLES.colors.text,
                    marginBottom: 6,
                }}
            >
                {label}
            </label>
        )}
        <input
            {...props}
            style={{
                width: "100%",
                height: 40,
                padding: "0 12px",
                borderRadius: 8,
                border: `1px solid ${STYLES.colors.border}`,
                backgroundColor: STYLES.colors.bgElevated,
                color: STYLES.colors.text,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                ...props.style,
            }}
        />
    </div>
);

export const ModalSelect = ({
    label,
    children,
    ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) => (
    <div style={{ marginBottom: 16 }}>
        {label && (
            <label
                style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 500,
                    color: STYLES.colors.text,
                    marginBottom: 6,
                }}
            >
                {label}
            </label>
        )}
        <div style={{ position: "relative" }}>
            <select
                {...props}
                style={{
                    width: "100%",
                    height: 40,
                    padding: "0 36px 0 12px",
                    borderRadius: 8,
                    border: `1px solid ${STYLES.colors.border}`,
                    backgroundColor: STYLES.colors.bgElevated,
                    color: STYLES.colors.text,
                    fontSize: 14,
                    outline: "none",
                    cursor: "pointer",
                    boxSizing: "border-box",
                    appearance: "none",
                    WebkitAppearance: "none",
                    colorScheme: "dark",
                    ...props.style,
                }}
            >
                {children}
            </select>
            {/* Custom dropdown arrow */}
            <div
                style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: STYLES.colors.textMuted,
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
            </div>
        </div>
    </div>
);

export const ModalTextarea = ({
    label,
    ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) => (
    <div style={{ marginBottom: 16 }}>
        {label && (
            <label
                style={{
                    display: "block",
                    fontSize: 14,
                    fontWeight: 500,
                    color: STYLES.colors.text,
                    marginBottom: 6,
                }}
            >
                {label}
            </label>
        )}
        <textarea
            {...props}
            style={{
                width: "100%",
                minHeight: 96,
                padding: 12,
                borderRadius: 8,
                border: `1px solid ${STYLES.colors.border}`,
                backgroundColor: STYLES.colors.bgElevated,
                color: STYLES.colors.text,
                fontSize: 14,
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
                ...props.style,
            }}
        />
    </div>
);

export const ModalButton = ({
    variant = "primary",
    children,
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary";
}) => (
    <button
        {...props}
        style={{
            height: 40,
            padding: "0 16px",
            borderRadius: 8,
            border: variant === "secondary" ? `1px solid ${STYLES.colors.border}` : "none",
            backgroundColor: variant === "primary" ? STYLES.colors.brand : "transparent",
            color: STYLES.colors.text,
            fontSize: 14,
            fontWeight: 500,
            cursor: props.disabled ? "not-allowed" : "pointer",
            opacity: props.disabled ? 0.5 : 1,
            ...props.style,
        }}
    >
        {children}
    </button>
);

export const ModalRow = ({
    children,
    cols = 2,
}: {
    children: ReactNode;
    cols?: number;
}) => (
    <div
        style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 16,
        }}
    >
        {children}
    </div>
);
