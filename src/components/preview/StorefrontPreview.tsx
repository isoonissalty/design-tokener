"use client";

import { useId, useState } from "react";
import { ArrowRight, Coffee, Headphones, Minus, NotebookPen, PackageCheck, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const products = [
  { id: "headphones", name: "Studio headphones", category: "Audio", description: "A little more focus. A lot more sound.", price: 8900, tag: "Bestseller", icon: Headphones },
  { id: "notebook", name: "Dot grid notebook", category: "Desk", description: "Space for the ideas worth keeping.", price: 1800, tag: "Made for ideas", icon: NotebookPen },
  { id: "mug", name: "Everyday mug", category: "Objects", description: "Your favorite ritual, thoughtfully made.", price: 2400, tag: "New arrival", icon: Coffee },
];

const categories = ["All", "Audio", "Desk", "Objects"];
const money = (cents: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

export function StorefrontPreview() {
  const bagId = useId();
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<Record<string, number>>({ notebook: 1 });
  const [message, setMessage] = useState("");
  const visibleProducts = products.filter(product => category === "All" || product.category === category);
  const cartItems = products.filter(product => (cart[product.id] ?? 0) > 0);
  const itemCount = cartItems.reduce((count, product) => count + cart[product.id], 0);
  const subtotal = cartItems.reduce((total, product) => total + product.price * cart[product.id], 0);
  const shipping = subtotal === 0 || subtotal >= 7500 ? 0 : 500;

  function addProduct(id: string) {
    const product = products.find(item => item.id === id)!;
    setCart(current => ({ ...current, [id]: Math.min((current[id] ?? 0) + 1, 10) }));
    setMessage(`${product.name} added to your bag.`);
  }

  function changeQuantity(id: string, change: number) {
    setCart(current => ({ ...current, [id]: Math.max(1, Math.min((current[id] ?? 1) + change, 10)) }));
    setMessage("Bag updated.");
  }

  function removeProduct(id: string) {
    setCart(current => {
      const next = { ...current };
      delete next[id];
      return next;
    });
    setMessage(`${products.find(product => product.id === id)!.name} removed from your bag.`);
  }

  return (
    <div className="preview-page mx-auto max-w-6xl space-y-8">
      <section className="flex flex-wrap items-end justify-between gap-6 border-b pb-8">
        <div className="max-w-xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">The everyday collection</span>
          <h1 className="text-4xl font-bold tracking-tight">Good things for your day.</h1>
          <p className="text-muted-foreground">Considered essentials for a calmer desk, a clearer mind, and everything in between.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm">
          <ShoppingBag className="h-4 w-4 text-primary" aria-hidden="true" />
          <span>Bag <span className="font-semibold">({itemCount})</span></span>
        </div>
      </section>

      <section aria-label="Product collection" className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Product category">
            {categories.map(value => (
              <Button key={value} variant={category === value ? "secondary" : "ghost"} size="sm" aria-pressed={category === value} onClick={() => setCategory(value)}>
                {value}
              </Button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{visibleProducts.length} {visibleProducts.length === 1 ? "essential" : "essentials"}</span>
        </div>

        <div className="preview-grid-three grid gap-4">
          {visibleProducts.map(product => {
            const Icon = product.icon;
            return (
              <Card key={product.id} className="flex min-w-0 flex-col overflow-hidden">
                <div className="relative flex h-48 items-center justify-center border-b bg-muted/50 p-6 text-primary" aria-hidden="true">
                  <span className="absolute left-4 top-4 rounded-full border bg-background px-2 py-1 text-xs text-foreground">{product.tag}</span>
                  <div className="flex h-28 w-28 rotate-[-8deg] items-center justify-center rounded-full border border-primary/20 bg-primary/10">
                    <Icon className="h-14 w-14" strokeWidth={1.25} />
                  </div>
                </div>
                <CardContent className="flex flex-1 flex-col gap-4 p-6">
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">{product.category}</span>
                    <h2 className="font-semibold">{product.name}</h2>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-2">
                    <span className="font-semibold">{money(product.price)}</span>
                    <Button size="sm" aria-label={`Add ${product.name} to bag`} disabled={(cart[product.id] ?? 0) >= 10} onClick={() => addProduct(product.id)}>
                      <Plus aria-hidden="true" />{(cart[product.id] ?? 0) >= 10 ? "Limit reached" : "Add to bag"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section aria-labelledby={bagId} className="rounded-xl border bg-card p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 id={bagId} className="font-semibold">Your bag <span className="text-muted-foreground">· {itemCount} {itemCount === 1 ? "item" : "items"}</span></h2>
          {itemCount > 0 && <Button variant="ghost" size="sm" onClick={() => { setCart({}); setMessage("Your bag is now empty."); }}>Clear bag</Button>}
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed bg-muted/30 px-4 py-10 text-center">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <h3 className="font-medium">A little room for something good.</h3>
            <p className="text-sm text-muted-foreground">Add an essential from the collection to get started.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <ul className="divide-y">
              {cartItems.map(product => {
                const Icon = product.icon;
                return (
                  <li key={product.id} className="flex flex-wrap items-center gap-4 py-4 first:pt-0">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-primary"><Icon className="h-6 w-6" aria-hidden="true" /></span>
                    <div className="min-w-0 flex-1 basis-36">
                      <h3 className="font-medium">{product.name}</h3>
                      <span className="text-xs text-muted-foreground">{money(product.price)} each</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-md border p-1" role="group" aria-label={`${product.name} quantity`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Decrease ${product.name} quantity`} disabled={cart[product.id] <= 1} onClick={() => changeQuantity(product.id, -1)}><Minus aria-hidden="true" /></Button>
                      <span className="min-w-6 text-center text-sm" aria-label={`${cart[product.id]} in bag`}>{cart[product.id]}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Increase ${product.name} quantity`} disabled={cart[product.id] >= 10} onClick={() => changeQuantity(product.id, 1)}><Plus aria-hidden="true" /></Button>
                    </div>
                    <span className="w-20 text-right text-sm font-medium">{money(product.price * cart[product.id])}</span>
                    <Button variant="ghost" size="icon" aria-label={`Remove ${product.name} from bag`} onClick={() => removeProduct(product.id)}><Trash2 aria-hidden="true" /></Button>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap items-start justify-between gap-6 border-t pt-6">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <PackageCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{shipping === 0 ? "Your order qualifies for free shipping." : `${money(7500 - subtotal)} away from free shipping.`}</span>
              </div>
              <div className="w-full max-w-sm space-y-3">
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Subtotal</dt><dd>{money(subtotal)}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Shipping</dt><dd>{shipping === 0 ? "Free" : money(shipping)}</dd></div>
                  <div className="flex justify-between gap-4 border-t pt-3 font-semibold"><dt>Total</dt><dd>{money(subtotal + shipping)}</dd></div>
                </dl>
                <Button className="w-full" onClick={() => setMessage(`Order preview ready: ${itemCount} ${itemCount === 1 ? "item" : "items"}, ${money(subtotal + shipping)} total. This is a sample checkout; no order was placed.`)}>Preview checkout<ArrowRight aria-hidden="true" /></Button>
              </div>
            </div>
          </div>
        )}
        <p className="mt-4 min-h-5 text-sm text-muted-foreground" role="status">{message || "A sample bag is ready to explore. Quantities are limited to 10 per item."}</p>
      </section>
      <p className="text-center text-xs text-muted-foreground">Thoughtful details. Everyday possibilities.</p>
    </div>
  );
}
