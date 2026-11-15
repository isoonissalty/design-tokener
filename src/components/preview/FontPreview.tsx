"use client";

import { useId, useState } from "react";
import { Check, CircleAlert, LoaderCircle, Type } from "lucide-react";
import { useThemeFontStatus } from "@/components/ThemeWrapper";
import { useAppSelector } from "@/store/hooks";
import { getFontOption } from "@/lib/font-options";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function FontPreview() {
  const family = useAppSelector(state => state.theme.present.foundation.typography.family);
  const status = useThemeFontStatus();
  const sampleId = useId();
  const [sample, setSample] = useState("Build something beautiful.\nสร้างสรรค์สิ่งที่สวยงามไปด้วยกัน\nDesign Tokens สำหรับทุกคน · 2026 / ๒๕๖๙");
  const enLabel = family.en ? getFontOption("en", family.en)?.label ?? family.en : "Current theme font";
  const thLabel = family.th ? getFontOption("th", family.th)?.label ?? family.th : "System fallback";
  const statusLabel = {
    system: "Using the current font stack",
    loading: "Loading web fonts…",
    ready: "Web fonts loaded",
    fallback: "Web fonts unavailable. Showing fallback fonts.",
  }[status];

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-5 sm:p-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary"><Type className="h-4 w-4" />English + Thai</span>
          <span role="status" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {status === "loading" ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : status === "ready" ? <Check className="h-3.5 w-3.5" /> : status === "fallback" ? <CircleAlert className="h-3.5 w-3.5" /> : null}
            {statusLabel}
          </span>
        </div>
        <h1 className="break-words">Good type speaks every language.</h1>
        <p className="text-muted-foreground">Compare English, Thai, and both scripts together using your current theme.</p>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 18rem), 1fr))" }}>
        <Card className="min-w-0">
          <CardHeader><div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>EN · English</span><span className="break-all">{enLabel}</span></div></CardHeader>
          <CardContent className="space-y-4" lang="en">
            <h2 className="break-words">Made to be read.</h2>
            <p>The quick brown fox jumps over the lazy dog. A clear rhythm makes every word feel at home.</p>
            <div className="border-t pt-4 text-sm leading-relaxed">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />0123456789 · @ # &amp; % ! ?</div>
          </CardContent>
        </Card>
        <Card className="min-w-0">
          <CardHeader><div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground"><span>TH · ภาษาไทย</span><span className="break-all">{thLabel}</span></div></CardHeader>
          <CardContent className="space-y-4" lang="th">
            <h2>ออกแบบให้อ่านสบาย</h2>
            <p>ตัวอักษรที่ดีช่วยให้ทุกเรื่องราวชัดเจน อ่านง่าย และสวยงาม ลองสังเกตสระและวรรณยุกต์ที่อยู่เหนือและใต้ตัวอักษร</p>
            <div className="border-t pt-4 text-sm leading-relaxed">ก ข ค ง จ ฉ ช ซ ญ ฐ ณ ด ต ถ ท ธ น<br />ปี่ เป้า น้ำ ผู้ใหญ่ กุ้ง เกื้อกูล<br />๐๑๒๓๔๕๖๗๘๙ · ฿ 1,250.00</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Mixed languages · ใช้ร่วมกัน</div></CardHeader>
        <CardContent className="space-y-4">
          <h3 lang="th">สร้างสรรค์ด้วย <span lang="en">Design Tokens</span></h3>
          <p lang="th">ฟอนต์ไทยและ <span lang="en">English</span> อยู่ด้วยกันได้อย่างลงตัว — รองรับทั้ง <span lang="en">headings, body text</span> และตัวเลข <span lang="en">0123456789</span></p>
          <div className="flex flex-wrap gap-3"><Button><span lang="th">เริ่มต้นใช้งาน</span> <span lang="en">Get started</span></Button><Button variant="outline"><span lang="en">Learn more</span> <span lang="th">ดูรายละเอียด</span></Button></div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <label htmlFor={sampleId} className="block">Try your own text · ลองพิมพ์ข้อความ</label>
        <textarea id={sampleId} value={sample} onChange={event => setSample(event.target.value)} spellCheck={false} className="min-h-40 w-full resize-y rounded-lg border bg-card p-4 font-sans text-base leading-relaxed text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      </div>
    </div>
  );
}
