"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Wordmark } from "@/components/brand/Mark";
import { LAYERS, stoneRig } from "@/components/stone/rig";
import { CutHistory } from "./CutHistory";
import { STONE_LAYERS } from "./layers";
import { TodayFragment } from "./TodayFragment";
import { AskFragment } from "./AskFragment";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const Stone = dynamic(() => import("@/components/stone/Stone"), { ssr: false });

export function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const [stoneOn, setStoneOn] = useState(true);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // One orchestrated entrance: the headline is laid down band by band, then the stone rises.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
        intro
          .from(".hero-line > span", { yPercent: 110, duration: 1.2, stagger: 0.09 })
          .from(".hero-after", { autoAlpha: 0, y: 16, duration: 0.9, stagger: 0.08 }, "-=0.7")
          .fromTo(".stone-layer", { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.6, ease: "power2.out" }, 0.2)
          .fromTo(stoneRig, { scale: 0.86 }, { scale: 1, duration: 2, ease: "expo.out" }, 0.2);

        // The stone splits into its layers as you scroll; each layer is pulled forward in turn.
        const panels = gsap.utils.toArray<HTMLElement>(".layer-panel");
        const ticks = gsap.utils.toArray<HTMLElement>(".layer-tick");
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ".strata",
            start: "top top",
            end: `+=${LAYERS * 90}%`,
            scrub: 0.7,
            pin: ".strata-pin",
            onUpdate: (self) => {
              const i = Math.min(LAYERS - 1, Math.max(0, Math.floor(((self.progress - 0.08) / 0.84) * LAYERS)));
              ticks.forEach((t, k) => t.toggleAttribute("data-on", k === i));
            },
          },
        });
        tl.to(stoneRig, { split: 1, duration: 1, ease: "power2.inOut" }).set(stoneRig, { active: LAYERS - 1 }, 0);
        panels.forEach((panel, i) => {
          const slab = LAYERS - 1 - i;
          tl.to(stoneRig, { active: slab, duration: 0.5, ease: "power1.inOut" }, i === 0 ? 0.5 : ">");
          tl.fromTo(panel, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: "power2.out" }, "<");
          tl.to({}, { duration: 0.9 });
          if (i < panels.length - 1) tl.to(panel, { autoAlpha: 0, y: -40, duration: 0.4, ease: "power2.in" });
        });
        tl.to(stoneRig, { split: 0, active: -1, duration: 1, ease: "power2.inOut" });

        // Fade the canvas away once the stone has been read, and stop rendering it.
        ScrollTrigger.create({
          trigger: ".after-stone",
          start: "top 70%",
          onEnter: () => {
            gsap.to(".stone-layer", { autoAlpha: 0, duration: 0.6 });
            setStoneOn(false);
          },
          onLeaveBack: () => {
            setStoneOn(true);
            gsap.to(".stone-layer", { autoAlpha: 1, duration: 0.6 });
          },
        });

        // Interface fragments slide up once, as a picture would be placed.
        gsap.utils.toArray<HTMLElement>(".placed").forEach((el) => {
          gsap.from(el, {
            y: 70,
            autoAlpha: 0,
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
          });
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(stoneRig, { split: 0.5, active: -1 });
        gsap.set(".layer-panel", { autoAlpha: 1 });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative overflow-x-clip">
      {/* WebGL stone, fixed behind the hero and the strata */}
      <div className="stone-layer pointer-events-none fixed inset-0 z-0 opacity-0">
        <div className="pointer-events-auto absolute inset-0">
          <Stone active={stoneOn} />
        </div>
      </div>

      <header className="fixed inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-5 md:px-10">
          <Link href="/" aria-label="Onyx OS home">
            <Wordmark />
          </Link>
          <nav className="flex items-center gap-1 text-[14px] text-chalk-2">
            <a href="#layers" className="hidden rounded-lg px-3 py-2 hover:text-chalk sm:block">
              What is inside
            </a>
            <a href="https://github.com/BinaryCoder3012/Onyx-OS" className="hidden rounded-lg px-3 py-2 hover:text-chalk sm:block">
              Source
            </a>
            <Link
              href="/os"
              className="ml-2 rounded-lg border border-seam-strong bg-slab/70 px-3.5 py-2 text-chalk backdrop-blur hover:border-chalk-3"
            >
              Open workspace
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-[1320px] flex-col justify-start px-5 pt-28 pb-[46svh] md:justify-center md:px-10 md:pt-16 md:pb-16">
        <div className="pointer-events-auto max-w-[620px]">
          <h1 className="font-display text-[clamp(3rem,7.6vw,6.6rem)] leading-[0.92] font-semibold tracking-[-0.035em] text-chalk">
            <span className="hero-line block overflow-hidden pb-[0.06em]">
              <span className="block">Your progress,</span>
            </span>
            <span className="hero-line block overflow-hidden pb-[0.06em]">
              <span className="block">set in stone.</span>
            </span>
          </h1>
          <p className="hero-after mt-7 max-w-[520px] text-[clamp(1.05rem,1.4vw,1.2rem)] leading-relaxed text-chalk-2">
            Onyx OS keeps the problems you solve, your contest ratings, a roadmap, your resume and the job hunt in one
            workspace, with an AI that has read all of it.
          </p>
          <div className="hero-after mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/os"
              className="inline-flex h-12 items-center rounded-xl bg-chalk px-6 text-[15px] font-semibold text-onyx transition-colors hover:bg-white"
            >
              Open your workspace
            </Link>
            <span className="text-[14px] text-chalk-3">No account. It lives in your browser.</span>
          </div>
          <div className="hero-after mt-12">
            <CutHistory />
          </div>
        </div>
      </section>

      {/* Strata: the stone opens into its seven layers */}
      <section id="layers" className="strata relative z-10">
        <div className="strata-pin pointer-events-none relative h-[100svh]">
          <div className="mx-auto grid h-full max-w-[1320px] grid-rows-[auto_1fr] px-5 pt-24 md:grid-cols-[minmax(0,560px)_1fr] md:grid-rows-1 md:items-center md:px-10 md:pt-0">
            <div className="relative">
              <h2 className="font-display text-[clamp(1.6rem,2.6vw,2.2rem)] leading-tight font-semibold tracking-[-0.02em] text-chalk">
                Seven layers, one stone.
              </h2>
              <ol className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-[14px]">
                {STONE_LAYERS.map((l) => (
                  <li
                    key={l.name}
                    className="layer-tick text-chalk-3 transition-colors duration-300 data-[on]:text-sard"
                  >
                    {l.name}
                  </li>
                ))}
              </ol>
              <div className="relative mt-8 min-h-[260px] md:min-h-[300px]">
                {STONE_LAYERS.map((l) => (
                  <article key={l.name} className="layer-panel pointer-events-auto absolute inset-x-0 top-0 opacity-0 motion-reduce:relative motion-reduce:mb-10">
                    <h3 className="font-display text-[clamp(2rem,4.2vw,3.4rem)] leading-[1] font-semibold tracking-[-0.03em] text-chalk">
                      {l.line}
                    </h3>
                    <p className="mt-5 max-w-[480px] text-[17px] leading-relaxed text-chalk-2">{l.body}</p>
                    <p className="mt-5 flex items-center gap-3 text-[14px] text-chalk-3">
                      <span className="text-chalk">{l.name}</span>
                      <span className="h-px w-8 bg-seam-strong" />
                      {l.detail}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* After the stone: the product itself */}
      <div className="after-stone relative z-10 bg-onyx">
        <section className="mx-auto max-w-[1320px] px-5 pt-32 pb-24 md:px-10 md:pt-44">
          <div className="grid gap-10 md:grid-cols-[minmax(0,420px)_1fr] md:gap-16">
            <div className="md:pt-10">
              <h2 className="font-display text-[clamp(2.2rem,4vw,3.4rem)] leading-[1] font-semibold tracking-[-0.03em]">
                It opens on today.
              </h2>
              <p className="mt-6 text-[17px] leading-relaxed text-chalk-2">
                Every morning the workspace reads itself and picks three moves: the deadline that is closest, the topic
                you have been avoiding, the roadmap step that is next. Your ratings, streak and focus hours sit beside them.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-chalk-3">Shown with a sample workspace.</p>
            </div>
            <div className="placed">
              <TodayFragment />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-36">
          <div className="grid gap-10 md:grid-cols-[1fr_minmax(0,420px)] md:gap-16">
            <div className="placed order-2 md:order-1">
              <AskFragment />
            </div>
            <div className="order-1 md:order-2 md:pt-10">
              <h2 className="font-display text-[clamp(2.2rem,4vw,3.4rem)] leading-[1] font-semibold tracking-[-0.03em]">
                Ask, and it already knows.
              </h2>
              <p className="mt-6 text-[17px] leading-relaxed text-chalk-2">
                Press <kbd className="rounded border border-seam-strong px-1.5 py-0.5 text-[14px] text-chalk">/</kbd>{" "}
                anywhere in the workspace. Each question carries a snapshot of your stone, so answers cite your own
                ratings, topics and deadlines instead of generic advice.
              </p>
              <p className="mt-4 text-[15px] leading-relaxed text-chalk-3">
                Runs on open-weight models through Ollama Cloud. Point it at your own Ollama to keep it on your machine.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-seam">
          <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-24 md:grid-cols-3 md:px-10 md:py-32">
            <div className="md:col-span-1">
              <h2 className="font-display text-[clamp(2rem,3.4vw,2.8rem)] leading-[1.02] font-semibold tracking-[-0.03em]">
                Yours, and only in your browser.
              </h2>
            </div>
            <dl className="grid gap-10 text-[16px] leading-relaxed sm:grid-cols-2 md:col-span-2">
              <div>
                <dt className="font-semibold text-chalk">No account to make</dt>
                <dd className="mt-2 text-chalk-2">
                  The workspace is saved in this browser&rsquo;s storage. Open it and start; there is nothing to sign up for.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-chalk">Export whenever you like</dt>
                <dd className="mt-2 text-chalk-2">
                  Settings saves the whole stone as one JSON file and loads it back on another machine.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-chalk">Public data only</dt>
                <dd className="mt-2 text-chalk-2">
                  Ratings come from each judge&rsquo;s public profile. Onyx never asks for a password to any of them.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-chalk">AI only when you ask</dt>
                <dd className="mt-2 text-chalk-2">
                  A short snapshot travels with each AI request and is not stored by Onyx. Nothing is sent in the background.
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="border-t border-seam">
          <div className="mx-auto flex max-w-[1320px] flex-col items-start justify-between gap-8 px-5 py-24 md:flex-row md:items-end md:px-10">
            <h2 className="max-w-[760px] font-display text-[clamp(2.6rem,6vw,5.2rem)] leading-[0.95] font-semibold tracking-[-0.035em]">
              Lay down today&rsquo;s band.
            </h2>
            <Link
              href="/os"
              className="inline-flex h-14 shrink-0 items-center rounded-xl bg-chalk px-7 text-[16px] font-semibold text-onyx transition-colors hover:bg-white"
            >
              Open your workspace
            </Link>
          </div>
        </section>

        <footer className="border-t border-seam">
          <div className="mx-auto flex max-w-[1320px] flex-col gap-4 px-5 py-10 text-[14px] text-chalk-3 md:flex-row md:items-center md:justify-between md:px-10">
            <Wordmark />
            <p>Made by Lakshya Sachdeva. Ratings from Codeforces, LeetCode, AtCoder and CodeChef public data.</p>
            <a href="https://github.com/BinaryCoder3012/Onyx-OS" className="hover:text-chalk">
              Source on GitHub
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
