"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import { 
  Package, Tag, ShoppingBag, Plus, Upload, Check, AlertCircle, LogOut, 
  ExternalLink, Layers, RefreshCw, Edit3, Trash2, Image as ImageIcon, X 
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"products" | "discounts" | "orders" | "categories">("products");
  const [categories, setCategories] = useState<any[]>([]);
  const [uploadingCategorySlug, setUploadingCategorySlug] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("c1111111-1111-1111-1111-111111111111");

  // Formulario nuevo producto
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdCategory, setNewProdCategory] = useState("c1111111-1111-1111-1111-111111111111");
  const [newProdPrice, setNewProdPrice] = useState("");
  const [newProdGsm, setNewProdGsm] = useState("240 GSM Algodón Peinado");
  const [newProdFit, setNewProdFit] = useState("oversized");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [sizesStock, setSizesStock] = useState<{ [key: string]: number }>({
    S: 15,
    M: 20,
    L: 10,
    XL: 8,
  });

  // Modal y estado para EDITAR producto existente
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editGsm, setEditGsm] = useState("");
  const [editFit, setEditFit] = useState("oversized");
  const [editCategory, setEditCategory] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editVariants, setEditVariants] = useState<any[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);

  // Formulario nuevo cupón
  const [showNewDiscountModal, setShowNewDiscountModal] = useState(false);
  const [newDiscCode, setNewDiscCode] = useState("");
  const [newDiscType, setNewDiscType] = useState<"percentage" | "fixed">("percentage");
  const [newDiscValue, setNewDiscValue] = useState("10");
  const [newDiscMin, setNewDiscMin] = useState("500");
  const [newDiscMaxUses, setNewDiscMaxUses] = useState("100");

  const [notification, setNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Helper para normalizar el array de imágenes
  const parseImages = (images: any): string[] => {
    if (Array.isArray(images)) return images;
    if (typeof images === "string") {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  // Abrir modal de nuevo producto con defaults según categoría
  const openNewProductModalForCategory = (catId?: string) => {
    const targetCatId = catId || selectedCategoryId || categories[0]?.id || "c1111111-1111-1111-1111-111111111111";
    const cat = categories.find((c) => String(c.id) === String(targetCatId));
    const slug = (cat?.slug || "").toLowerCase();

    setNewProdCategory(targetCatId);
    setNewProdName("");
    setNewProdPrice("");
    setUploadedImages([]);
    setNewProdDesc("");

    if (slug.includes("compresion")) {
      setNewProdGsm("220 GSM Spandex Blend");
      setNewProdFit("compression");
      setSizesStock({ S: 10, M: 20, L: 15, XL: 5 });
    } else if (slug.includes("bottom") || slug.includes("baggy")) {
      setNewProdGsm("320 GSM French Terry");
      setNewProdFit("regular");
      setSizesStock({ S: 10, M: 20, L: 15, XL: 10 });
    } else if (slug.includes("accesorio")) {
      setNewProdGsm("Nylon Reforzado");
      setNewProdFit("athletic");
      setSizesStock({ OS: 30 });
    } else {
      setNewProdGsm("240 GSM Algodón Peinado");
      setNewProdFit("oversized");
      setSizesStock({ S: 15, M: 20, L: 15, XL: 8 });
    }

    setShowNewProductModal(true);
  };

  // Conteo de prendas activas por categoría
  const getCategoryProductCount = (catId: string, catSlug?: string) => {
    return products.filter((p) => {
      if (p.category_id && String(p.category_id) === String(catId)) return true;
      if (p.category_slug && catSlug && p.category_slug === catSlug) return true;
      return false;
    }).length;
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, discRes, ordRes, catRes] = await Promise.all([
        fetch("/api/admin/products", { cache: "no-store" }),
        fetch("/api/admin/discounts", { cache: "no-store" }),
        fetch("/api/v1/orders", { cache: "no-store" }),
        fetch("/api/admin/categories", { cache: "no-store" }),
      ]);

      if (prodRes.ok) {
        const d = await prodRes.json();
        setProducts(d.products || []);
      }
      if (discRes.ok) {
        const d = await discRes.json();
        setDiscounts(d.discounts || []);
      }
      if (ordRes.ok) {
        const d = await ordRes.json();
        setOrders(d.orders || []);
      }
      if (catRes.ok) {
        const cats = await catRes.json();
        const loadedCats = Array.isArray(cats) ? cats : [];
        setCategories(loadedCats);
        if (loadedCats.length > 0) {
          setSelectedCategoryId((prev) => (prev ? prev : loadedCats[0].id));
        }
      }
    } catch (err) {
      console.error("Error al cargar datos de admin:", err);
    } finally {
      setLoading(false);
    }
  };

  // Subir portada para una categoría del catálogo / Bento
  const handleCategoryCoverUpload = async (catId: string, slug: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCategorySlug(slug);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || "Error al subir imagen");

      const imageUrl = uploadData.url;

      const patchRes = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: catId,
          slug,
          imageUrl,
        }),
      });

      const patchData = await patchRes.json();
      if (!patchRes.ok) throw new Error(patchData.error || "Error al asociar imagen a la categoría");

      setCategories((prev) =>
        prev.map((c) => (c.slug === slug || c.id === catId ? { ...c, imageUrl } : c))
      );

      showToast(`¡Portada de ${slug.toUpperCase()} actualizada con éxito!`);
    } catch (err: any) {
      alert(err.message || "Error al actualizar portada de categoría");
    } finally {
      setUploadingCategorySlug(null);
      e.target.value = "";
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  // Subir imagen para NUEVO drop
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir archivo");

      setUploadedImages((prev) => [...prev, data.url]);
      showToast("Imagen subida con éxito");
    } catch (err: any) {
      alert(err.message || "Error al subir imagen");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  // Subir imagen para DROP EN EDICIÓN
  const handleEditFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingEditImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al subir archivo");

      setEditImages((prev) => [...prev, data.url]);
      showToast("Foto añadida a la galería del drop");
    } catch (err: any) {
      alert(err.message || "Error al subir foto");
    } finally {
      setUploadingEditImage(false);
      e.target.value = "";
    }
  };

  // Crear Producto / Drop
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      alert("Por favor ingresa el nombre de la prenda");
      return;
    }
    const price = Number(newProdPrice);
    if (isNaN(price) || price <= 0) {
      alert("Por favor ingresa un precio base válido en MXN");
      return;
    }

    try {
      const variants = Object.entries(sizesStock).map(([size, stock]) => ({
        size,
        stock: Number(stock),
        colorName: "Negro",
        colorHex: "#111111",
        price: price,
      }));

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProdName.trim(),
          description: newProdDesc,
          materialGsm: newProdGsm,
          fitType: newProdFit,
          basePrice: price,
          categoryId: newProdCategory,
          images: uploadedImages,
          variants,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear producto");

      showToast(`¡Drop "${newProdName}" publicado con éxito!`);
      setShowNewProductModal(false);
      setNewProdName("");
      setNewProdPrice("");
      setNewProdDesc("");
      setUploadedImages([]);
      loadData();
    } catch (err: any) {
      alert(err.message || "Error al publicar drop");
    }
  };

  // Abrir modal de edición
  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setEditName(product.name || "");
    setEditPrice(product.base_price?.toString() || "");
    setEditGsm(product.material_gsm || "240 GSM Algodón Peinado");
    setEditFit(product.fit_type || "oversized");
    setEditDesc(product.description || "");
    setEditCategory(product.category_id || "");
    setEditImages(parseImages(product.images));
    setEditVariants(
      product.variants && product.variants.length > 0
        ? product.variants.map((v: any) => ({ ...v }))
        : [
            { size: "S", stock: 10 },
            { size: "M", stock: 15 },
            { size: "L", stock: 10 },
            { size: "XL", stock: 5 },
          ]
    );
  };

  // Guardar cambios del producto editado
  const handleSaveProductEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const price = Number(editPrice);
    if (isNaN(price) || price <= 0) {
      alert("El precio debe ser un número válido mayor a 0");
      return;
    }

    setSavingEdit(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProduct.id,
          name: editName.trim(),
          basePrice: price,
          categoryId: editCategory,
          materialGsm: editGsm,
          fitType: editFit,
          description: editDesc,
          images: editImages,
          variants: editVariants,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar producto");

      showToast("Drop e inventario actualizados con éxito");
      setEditingProduct(null);
      loadData();
    } catch (err: any) {
      alert(err.message || "Error al guardar cambios");
    } finally {
      setSavingEdit(false);
    }
  };

  // Eliminar producto
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar permanentemente el drop "${name}"? Esta acción borrará todas sus variantes e inventario.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");

      showToast(`Drop "${name}" eliminado`);
      setEditingProduct(null);
      loadData();
    } catch (err: any) {
      alert(err.message || "Error al eliminar drop");
    }
  };

  // Ajustar stock rápido por talla (+ / -)
  const handleUpdateStock = async (variantId: string, currentStock: number, delta: number) => {
    const nextStock = Math.max(0, currentStock + delta);
    try {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, stockQuantity: nextStock }),
      });
      if (res.ok) {
        showToast("Stock actualizado");
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Crear Cupón
  const handleCreateDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: newDiscCode,
          discountType: newDiscType,
          discountValue: Number(newDiscValue),
          minOrderAmount: Number(newDiscMin),
          maxUses: Number(newDiscMaxUses),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear cupón");

      showToast(`Cupón "${newDiscCode.toUpperCase()}" activado`);
      setShowNewDiscountModal(false);
      setNewDiscCode("");
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Alternar estado de cupón
  const toggleDiscountStatus = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/discounts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus }),
      });
      if (res.ok) {
        showToast("Estado de cupón actualizado");
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground font-black text-xs px-5 py-3 rounded-xl shadow-glow flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Bar */}
      <header className="border-b border-border-subtle bg-surface px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8">
            <Image src="/images/logo/white_bee.png" alt="Logo" fill className="object-contain" />
          </div>
          <div>
            <span className="font-display text-2xl tracking-widest text-foreground">
              GYMBEES ADMIN
            </span>
            <span className="text-[10px] font-mono text-primary block">
              PANEL DE CONTROL DE DROPS &amp; INVENTARIO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            target="_blank"
            className="text-xs font-bold text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
          >
            <span>Ver Tienda en Vivo</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={handleLogout}
            className="bg-surface-elevated hover:bg-border-subtle border border-border-subtle text-xs font-bold text-foreground px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-border-subtle space-x-6 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("products")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "products"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Prendas &amp; Drops ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("discounts")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "discounts"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Cupones de Descuento ({discounts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "orders"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Órdenes &amp; Pedidos ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === "categories"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Portadas de Categorías ({categories.length})</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PRENDAS & DROPS */}
        {/* ========================================================================= */}
        {activeTab === "products" && (() => {
          const activeCategory =
            categories.find((c) => String(c.id) === String(selectedCategoryId)) || categories[0];

          const filteredProducts = products.filter((p) => {
            if (!activeCategory) return true;
            if (p.category_id && String(p.category_id) === String(activeCategory.id)) return true;
            if (p.category_slug && p.category_slug === activeCategory.slug) return true;
            if (
              p.category_name &&
              activeCategory.name &&
              p.category_name.toLowerCase().includes(activeCategory.name.toLowerCase().slice(0, 6))
            )
              return true;
            return false;
          });

          const totalStockInActiveCategory = filteredProducts.reduce((acc, p) => {
            const pStock = (p.variants || []).reduce(
              (sum: number, v: any) => sum + (Number(v.stock) || 0),
              0
            );
            return acc + pStock;
          }, 0);

          return (
            <div className="space-y-7">
              {/* 1. Selector de Colecciones / Categorías (Cards Visuales) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 font-mono">
                    <Layers className="w-3.5 h-3.5 text-primary" />
                    <span>Colecciones Activas ({categories.length})</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono hidden sm:inline">
                    Selecciona una tarjeta para gestionar sus prendas y publicar drops
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  {categories.map((cat) => {
                    const isSelected = String(cat.id) === String(selectedCategoryId);
                    const count = getCategoryProductCount(cat.id, cat.slug);

                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`relative p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center gap-3.5 group select-none ${
                          isSelected
                            ? "bg-surface-elevated border-primary shadow-[0_0_20px_rgba(234,179,8,0.18)] ring-1 ring-primary/50"
                            : "bg-surface/70 border-border-subtle hover:border-border-strong hover:bg-surface-elevated/60 opacity-75 hover:opacity-100"
                        }`}
                      >
                        {/* Miniatura de la portada */}
                        <div className="w-13 h-16 bg-background border border-border-subtle rounded-xl overflow-hidden shrink-0 relative flex items-center justify-center">
                          {cat.imageUrl ? (
                            <img
                              src={cat.imageUrl}
                              alt={cat.name}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <Layers className="w-5 h-5 text-muted-foreground/40" />
                          )}
                        </div>

                        {/* Información de la categoría */}
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-mono font-bold tracking-wider text-primary uppercase block truncate">
                            {cat.tag || "DROP OFICIAL"}
                          </span>
                          <h4 className="font-display text-base uppercase text-foreground leading-tight truncate mt-0.5">
                            {cat.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-md border ${
                                count > 0
                                  ? "bg-primary/10 border-primary/20 text-primary font-bold"
                                  : "bg-background border-border-subtle text-muted-foreground"
                              }`}
                            >
                              {count} {count === 1 ? "prenda" : "prendas"}
                            </span>
                            {isSelected && (
                              <span className="text-[9px] font-black tracking-widest uppercase text-emerald-400 font-mono flex items-center gap-1">
                                ● ACTIVA
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. Cabecera Contextual de la Colección Seleccionada */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-3 border-t border-border-subtle/60">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                      COLECCIÓN ACTIVA
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {filteredProducts.length}{" "}
                      {filteredProducts.length === 1 ? "prenda" : "prendas"} •{" "}
                      {totalStockInActiveCategory} pzas en almacén
                    </span>
                  </div>
                  <h2 className="font-display text-3xl uppercase tracking-wider text-foreground mt-1">
                    {activeCategory?.name || "Colección Seleccionada"}
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-xl">
                    {activeCategory?.description ||
                      "Gestiona prendas, edita fotos y ajusta existencias en tiempo real."}
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    onClick={loadData}
                    className="p-3 bg-surface border border-border-subtle rounded-xl text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition-colors"
                    title="Recargar datos"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openNewProductModalForCategory(activeCategory?.id)}
                    className="bg-primary hover:bg-white text-primary-foreground font-black text-xs uppercase tracking-widest px-5 py-3 rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>
                      Publicar en {activeCategory?.name?.split(" ")[0] || "Colección"}
                    </span>
                  </button>
                </div>
              </div>

              {/* 3. Listado de Prendas de la Colección o Empty State */}
              {filteredProducts.length === 0 ? (
                <div className="bg-surface border border-dashed border-border-subtle rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-border-subtle flex items-center justify-center text-muted-foreground">
                    <Package className="w-8 h-8 opacity-40 text-primary" />
                  </div>
                  <div className="space-y-1.5 max-w-sm">
                    <h3 className="font-display text-xl uppercase tracking-wider text-foreground">
                      Aún no hay prendas en {activeCategory?.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Esta colección está lista para recibir su primer lanzamiento oficial. Al
                      publicar aquí, la categoría quedará asignada por defecto.
                    </p>
                  </div>
                  <button
                    onClick={() => openNewProductModalForCategory(activeCategory?.id)}
                    className="bg-primary hover:bg-white text-primary-foreground font-black text-xs uppercase tracking-widest px-6 py-3 rounded-xl shadow-glow transition-all flex items-center gap-2 active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>
                      Publicar Primer Drop en{" "}
                      {activeCategory?.name?.split(" ")[0] || "esta colección"}
                    </span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredProducts.map((p) => {
                    const prodImages = parseImages(p.images);
                    return (
                      <div
                        key={p.id}
                        className="bg-surface border border-border-subtle rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row gap-5 sm:gap-6 items-start md:items-center justify-between transition-all hover:border-border-strong group"
                      >
                        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                          {/* Thumbnail con img nativo para renderizado infalible */}
                          <div className="w-20 h-24 sm:w-22 sm:h-26 bg-surface-elevated border border-border-subtle rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative">
                            {prodImages.length > 0 ? (
                              <img
                                src={prodImages[0]}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <ImageIcon className="w-6 h-6 opacity-40 mb-1" />
                                <span className="font-display text-[10px]">SIN FOTO</span>
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <span className="text-[10px] font-mono font-bold tracking-widest text-primary uppercase block truncate">
                              {p.category_name || activeCategory?.name || "DROP EXCLUSIVO"} •{" "}
                              {p.material_gsm}
                            </span>
                            <h3 className="font-display text-xl sm:text-2xl uppercase text-foreground leading-tight truncate mt-0.5">
                              {p.name}
                            </h3>
                            <p className="text-sm font-extrabold text-foreground mt-0.5 font-mono">
                              {formatPrice(p.base_price)}
                            </p>
                            <span className="text-[10px] text-muted-foreground font-mono block mt-1">
                              {prodImages.length} fotografía
                              {prodImages.length === 1 ? "" : "s"} vinculada
                              {prodImages.length === 1 ? "" : "s"}
                            </span>
                          </div>
                        </div>

                        {/* Controles de Acción y Stock */}
                        <div className="w-full md:w-auto flex flex-col sm:flex-row items-start sm:items-center gap-3.5">
                          {/* Tallas y Stock */}
                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-surface-elevated p-2 sm:p-2.5 rounded-xl border border-border-subtle">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mr-1 font-mono">
                              STOCK:
                            </span>
                            {p.variants?.map((v: any) => (
                              <div
                                key={v.id}
                                className="flex items-center gap-1.5 bg-background px-2 sm:px-2.5 py-1.5 rounded-lg border border-border-subtle text-xs"
                              >
                                <span className="font-bold text-foreground font-mono">
                                  {v.size}:
                                </span>
                                <span
                                  className={`font-mono font-black ${
                                    v.stock <= 3 ? "text-amber-400" : "text-foreground"
                                  }`}
                                >
                                  {v.stock}
                                </span>
                                <div className="flex items-center gap-0.5 ml-1">
                                  <button
                                    onClick={() => handleUpdateStock(v.id, v.stock, -1)}
                                    className="w-4 h-4 bg-surface hover:bg-border-subtle rounded flex items-center justify-center text-muted-foreground hover:text-foreground text-[10px] font-bold"
                                  >
                                    -
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStock(v.id, v.stock, 1)}
                                    className="w-4 h-4 bg-surface hover:bg-border-subtle rounded flex items-center justify-center text-muted-foreground hover:text-foreground text-[10px] font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Botón Editar Drop Completo */}
                          <button
                            onClick={() => openEditModal(p)}
                            className="bg-surface-elevated hover:bg-border-subtle border border-border-subtle hover:border-border-strong text-foreground text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-sm shrink-0"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-primary" />
                            <span>Editar Drop</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* ========================================================================= */}
        {/* TAB 2: CUPONES DE DESCUENTO */}
        {/* ========================================================================= */}
        {activeTab === "discounts" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-display text-3xl uppercase tracking-wider text-foreground">
                  Códigos de Descuento &amp; Atletas
                </h2>
                <p className="text-xs text-muted-foreground">
                  Configura cupones para lanzamientos o códigos de influencers para rastrear ventas.
                </p>
              </div>

              <button
                onClick={() => setShowNewDiscountModal(true)}
                className="bg-primary hover:bg-white text-primary-foreground font-black text-xs uppercase tracking-widest px-5 py-2.5 rounded-xl shadow-glow transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Nuevo Cupón</span>
              </button>
            </div>

            {/* Discounts Table */}
            <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated border-b border-border-subtle font-mono text-[11px] text-muted-foreground uppercase">
                  <tr>
                    <th className="p-4">CÓDIGO</th>
                    <th className="p-4">TIPO &amp; BENEFICIO</th>
                    <th className="p-4">COMPRA MÍNIMA</th>
                    <th className="p-4">USOS REGISTRADOS</th>
                    <th className="p-4">ESTADO</th>
                    <th className="p-4 text-right">ACCIÓN</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {discounts.map((d) => (
                    <tr key={d.id} className="hover:bg-surface-elevated/50 transition-colors">
                      <td className="p-4 font-mono font-black text-sm text-foreground">
                        {d.code}
                      </td>
                      <td className="p-4 font-bold text-foreground">
                        {d.discount_type === "percentage"
                          ? `${d.discount_value}% DE DESCUENTO`
                          : `-${formatPrice(d.discount_value)} MXN FIJO`}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {Number(d.min_order_amount) > 0 ? formatPrice(d.min_order_amount) : "Sin mínimo"}
                      </td>
                      <td className="p-4 font-mono font-bold text-foreground">
                        {d.uses_count} {d.max_uses ? `/ ${d.max_uses}` : "veces"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            d.is_active
                              ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                              : "bg-surface text-muted-foreground border border-border-subtle"
                          }`}
                        >
                          {d.is_active ? "ACTIVO" : "PAUSADO"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => toggleDiscountStatus(d.id, d.is_active)}
                          className="bg-surface-elevated hover:bg-border-subtle text-foreground text-xs font-bold px-3 py-1.5 rounded-lg border border-border-subtle transition-colors"
                        >
                          {d.is_active ? "Pausar" : "Reactivar"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ÓRDENES */}
        {/* ========================================================================= */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-3xl uppercase tracking-wider text-foreground">
                Órdenes &amp; Envíos
              </h2>
              <p className="text-xs text-muted-foreground">
                Monitorea pedidos procesados, clientes y números de guía.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="bg-surface border border-border-subtle rounded-2xl p-12 text-center text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-display text-xl text-foreground uppercase">
                  Aún no hay compras registradas
                </p>
                <p className="text-xs mt-1">
                  Las órdenes confirmadas aparecerán aquí con su ticket contable.
                </p>
              </div>
            ) : (
              <div className="bg-surface border border-border-subtle rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-elevated border-b border-border-subtle font-mono text-[11px] text-muted-foreground uppercase">
                    <tr>
                      <th className="p-4">NO. ORDEN</th>
                      <th className="p-4">CLIENTE</th>
                      <th className="p-4">ESTADO PAGO</th>
                      <th className="p-4">ENVÍO</th>
                      <th className="p-4">TOTAL</th>
                      <th className="p-4 text-right">TICKET</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-subtle">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-surface-elevated/50 transition-colors">
                        <td className="p-4 font-mono font-bold text-foreground">
                          {o.order_number}
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-foreground">{o.customer_name || "Cliente"}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{o.customer_email}</p>
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                            {o.payment_status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-[11px] font-mono text-muted-foreground uppercase">
                            {o.status}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-foreground font-mono">
                          {formatPrice(o.total)}
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href={`/orden/${o.order_number}`}
                            target="_blank"
                            className="text-primary hover:underline font-bold inline-flex items-center gap-1"
                          >
                            <span>Ver</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* TAB 4: PORTADAS DE CATEGORÍAS & BENTO GRID */}
        {/* ========================================================================= */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-display text-3xl uppercase tracking-wider text-foreground">
                  Portadas de Categorías &amp; Bento Grid
                </h2>
                <p className="text-xs text-muted-foreground">
                  Personaliza la foto de campaña para cada silueta (Baggys, Pump Covers, Compresión, Accesorios). Se actualiza en tiempo real en la tienda.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={loadData}
                  className="p-2.5 bg-surface border border-border-subtle rounded-xl text-muted-foreground hover:text-foreground transition-colors"
                  title="Recargar datos"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {categories.length === 0 ? (
              <div className="bg-surface border border-border-subtle rounded-2xl p-12 text-center text-muted-foreground">
                <Layers className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p className="font-display text-xl text-foreground uppercase">
                  Cargando categorías...
                </p>
                <p className="text-xs mt-1">
                  Si no aparecen, haz clic en el botón de recargar.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {categories.map((cat) => {
                  const isUploading = uploadingCategorySlug === cat.slug;
                  return (
                    <div
                      key={cat.slug}
                      className="bg-surface border border-border-subtle rounded-2xl p-5 flex flex-col justify-between hover:border-border-strong transition-all shadow-lg group"
                    >
                      <div>
                        {/* Preview de la Portada Actual */}
                        <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-surface-elevated border border-border-subtle mb-4 group-hover:border-primary/50 transition-colors">
                          {cat.imageUrl ? (
                            <img
                              src={cat.imageUrl}
                              alt={cat.name}
                              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-muted-foreground">
                              <ImageIcon className="w-10 h-10 mb-2 opacity-30" />
                              <span className="text-xs font-mono">Sin Portada</span>
                            </div>
                          )}

                          {/* Badge de Tag */}
                          {cat.tag && (
                            <div className="absolute top-2.5 left-2.5 z-10">
                              <span className="text-[9px] font-mono font-bold tracking-wider text-primary bg-black/80 border border-white/10 px-2 py-0.5 rounded backdrop-blur-md uppercase">
                                {cat.tag}
                              </span>
                            </div>
                          )}

                          {/* Link flotante para ver en tienda */}
                          <Link
                            href={`/categoria/${cat.slug}`}
                            target="_blank"
                            className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-black/75 border border-white/10 flex items-center justify-center text-white hover:text-primary transition-colors backdrop-blur-md"
                            title="Ver en vivo"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>

                        {/* Textos descriptivos */}
                        <div className="space-y-1 mb-4">
                          <h3 className="font-display text-xl uppercase tracking-wide text-foreground">
                            {cat.name}
                          </h3>
                          <p className="text-[11px] font-mono text-primary font-bold">
                            /categoria/{cat.slug}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 pt-1 leading-relaxed">
                            {cat.description || "Sin descripción"}
                          </p>
                        </div>
                      </div>

                      {/* Botón de Subida Directa */}
                      <div className="pt-2">
                        <label className={`w-full py-2.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          isUploading
                            ? "bg-surface-elevated text-muted-foreground border border-border-subtle cursor-wait"
                            : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-primary/20 active:scale-98"
                        }`}>
                          {isUploading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Subiendo foto...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4" />
                              <span>{cat.imageUrl ? "Cambiar Portada" : "Subir Portada"}</span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            disabled={isUploading}
                            className="hidden"
                            onChange={(e) => handleCategoryCoverUpload(cat.id, cat.slug, e)}
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      {/* MODAL: NUEVO PRODUCTO / DROP */}
      {/* ========================================================================= */}
      {showNewProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-200">
          <div className="bg-surface border border-border-subtle rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-border-subtle pb-4">
              <div>
                <h3 className="font-display text-3xl uppercase tracking-wider text-foreground">
                  PUBLICAR EN {categories.find((c) => String(c.id) === String(newProdCategory))?.name?.toUpperCase() || "NUEVO DROP"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Ingresa las especificaciones de tejido, gramaje y sube la foto del producto.
                </p>
              </div>
              <button
                onClick={() => setShowNewProductModal(false)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Nombre de la Prenda
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Berserk Guts Heavy Pump Cover"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Colección Destino
                    </label>
                    <span className="text-[10px] font-mono text-primary font-bold">
                      ● Preseleccionada
                    </span>
                  </div>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full bg-background border border-primary/50 focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none font-bold"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Corte / Silueta
                  </label>
                  <select
                    value={newProdFit}
                    onChange={(e) => setNewProdFit(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none font-bold uppercase"
                  >
                    <option value="oversized">Oversized</option>
                    <option value="compression">Compresión</option>
                    <option value="regular">Regular</option>
                    <option value="athletic">Athletic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Precio Base ($ MXN)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="649"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Gramaje de Tela
                  </label>
                  <input
                    type="text"
                    value={newProdGsm}
                    onChange={(e) => setNewProdGsm(e.target.value)}
                    placeholder="240 GSM Algodón Peinado"
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Descripción Técnica
                </label>
                <textarea
                  rows={3}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  placeholder="Detalla corte de hombro, caída de la prenda y resistencia para levantamiento."
                  className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none"
                />
              </div>

              {/* Subida de Imagen con Preview Confiable */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Subir Fotografía del Producto (JPG, PNG, WebP)
                </label>
                
                <div className="border-2 border-dashed border-border-subtle rounded-xl p-6 text-center hover:border-border-strong transition-colors bg-background">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-foreground font-bold">
                    Arrastra o selecciona la imagen del Drop
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Se optimiza y almacena de forma local e inmediata
                  </p>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="imageUploadInput"
                  />
                  <label
                    htmlFor="imageUploadInput"
                    className="mt-3 inline-block bg-surface-elevated hover:bg-border-subtle text-foreground text-xs font-bold px-4 py-2 rounded-lg cursor-pointer border border-border-subtle"
                  >
                    {uploadingImage ? "Subiendo..." : "Examinar archivo"}
                  </label>
                </div>

                {/* Previews de imágenes subidas con botón de remover */}
                {uploadedImages.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {uploadedImages.map((img, i) => (
                      <div key={i} className="relative w-20 h-24 rounded-lg overflow-hidden border border-border-strong group">
                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-black/80 hover:bg-rose-900 text-white p-1 rounded-full opacity-80 group-hover:opacity-100 transition-opacity"
                          title="Eliminar foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tallas iniciales */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Existencias Iniciales por Talla:
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {["S", "M", "L", "XL"].map((sz) => (
                    <div key={sz} className="bg-background p-3 rounded-xl border border-border-subtle text-center">
                      <span className="font-bold text-xs block mb-1">TALLA {sz}</span>
                      <input
                        type="number"
                        min="0"
                        value={sizesStock[sz]}
                        onChange={(e) => setSizesStock({ ...sizesStock, [sz]: Number(e.target.value) })}
                        className="w-full bg-surface text-center font-mono font-bold text-xs py-1.5 rounded border border-border-subtle outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-border-subtle text-xs font-bold uppercase hover:bg-surface-elevated text-muted-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-white text-primary-foreground font-black text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl shadow-glow transition-all"
                >
                  Confirmar y Publicar Drop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITAR DROP EXISTENTE & GESTIONAR FOTOS */}
      {/* ========================================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-200">
          <div className="bg-surface border border-border-subtle rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-border-subtle pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-primary uppercase">
                  EDITAR PRENDA ID: {editingProduct.id.slice(0, 8)}...
                </span>
                <h3 className="font-display text-3xl uppercase tracking-wider text-foreground">
                  {editingProduct.name}
                </h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleSaveProductEdit} className="space-y-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Nombre de la Prenda
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Categoría / Colección
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none font-bold"
                  >
                    <option value="">-- Sin Categoría --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Corte / Silueta
                  </label>
                  <select
                    value={editFit}
                    onChange={(e) => setEditFit(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none font-bold uppercase"
                  >
                    <option value="oversized">Oversized</option>
                    <option value="compression">Compresión</option>
                    <option value="regular">Regular</option>
                    <option value="athletic">Athletic</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Precio ($ MXN)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Gramaje de Tela
                  </label>
                  <input
                    type="text"
                    value={editGsm}
                    onChange={(e) => setEditGsm(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Descripción Técnica
                </label>
                <textarea
                  rows={3}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-3 px-4 text-xs text-foreground outline-none"
                />
              </div>

              {/* Galería de Fotografías del Drop */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Fotografías Asociadas ({editImages.length})
                </label>

                {/* Grid de imágenes con botón de eliminar */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-3 bg-background rounded-xl border border-border-subtle">
                  {editImages.map((img, i) => (
                    <div key={i} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-border-strong group bg-surface">
                      <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setEditImages((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-1.5 right-1.5 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-md opacity-80 group-hover:opacity-100 transition-opacity"
                        title="Eliminar esta foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {/* Botón para subir más fotos a este drop */}
                  <label className="aspect-[3/4] rounded-lg border-2 border-dashed border-border-subtle hover:border-primary flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center bg-surface">
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleEditFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                    <span className="text-[10px] font-bold text-foreground">
                      {uploadingEditImage ? "Subiendo..." : "+ Subir Foto"}
                    </span>
                  </label>
                </div>
              </div>

              {/* Ajuste de Existencias por Talla en Modal */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Existencias por Talla:
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {editVariants.map((v, idx) => (
                    <div key={v.id || idx} className="bg-background p-3 rounded-xl border border-border-subtle text-center">
                      <span className="font-bold text-xs block mb-1">TALLA {v.size}</span>
                      <input
                        type="number"
                        min="0"
                        value={v.stock}
                        onChange={(e) => {
                          const updated = [...editVariants];
                          updated[idx].stock = Number(e.target.value);
                          setEditVariants(updated);
                        }}
                        className="w-full bg-surface text-center font-mono font-bold text-xs py-1.5 rounded border border-border-subtle outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(editingProduct.id, editingProduct.name)}
                  className="px-4 py-2.5 rounded-xl border border-rose-900 bg-rose-950/30 text-rose-300 hover:bg-rose-950 text-xs font-bold uppercase flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Drop</span>
                </button>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-5 py-2.5 rounded-xl border border-border-subtle text-xs font-bold uppercase hover:bg-surface-elevated text-muted-foreground"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="bg-primary hover:bg-white text-primary-foreground font-black text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl shadow-glow transition-all"
                  >
                    {savingEdit ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: NUEVO CUPÓN */}
      {/* ========================================================================= */}
      {showNewDiscountModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in-0 duration-200">
          <div className="bg-surface border border-border-subtle rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-border-subtle pb-3">
              <h3 className="font-display text-2xl uppercase tracking-wider text-foreground">
                NUEVO CÓDIGO DE DESCUENTO
              </h3>
              <button
                onClick={() => setShowNewDiscountModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs font-bold"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleCreateDiscount} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Código (Mayúsculas)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. BEES15 o VERANO2026"
                  value={newDiscCode}
                  onChange={(e) => setNewDiscCode(e.target.value.toUpperCase())}
                  className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-2.5 px-3 text-xs font-mono font-bold text-foreground outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Tipo de Beneficio
                  </label>
                  <select
                    value={newDiscType}
                    onChange={(e: any) => setNewDiscType(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-2.5 px-3 text-xs text-foreground outline-none"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($ MXN)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Valor
                  </label>
                  <input
                    type="number"
                    required
                    value={newDiscValue}
                    onChange={(e) => setNewDiscValue(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-2.5 px-3 text-xs text-foreground outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Compra Mínima ($)
                  </label>
                  <input
                    type="number"
                    value={newDiscMin}
                    onChange={(e) => setNewDiscMin(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-2.5 px-3 text-xs text-foreground outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Límite de Usos
                  </label>
                  <input
                    type="number"
                    value={newDiscMaxUses}
                    onChange={(e) => setNewDiscMaxUses(e.target.value)}
                    className="w-full bg-background border border-border-subtle focus:border-primary rounded-xl py-2.5 px-3 text-xs text-foreground outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border-subtle flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewDiscountModal(false)}
                  className="px-4 py-2 rounded-xl border border-border-subtle text-xs font-bold uppercase hover:bg-surface-elevated text-muted-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-white text-primary-foreground font-black text-xs uppercase tracking-widest px-5 py-2 rounded-xl shadow-glow transition-all"
                >
                  Activar Cupón
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
