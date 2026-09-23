"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FRAME_COUNT = 711;
const scenes = [
    [0, 90, "01 / 07", "FOUR SEASONS HOTEL CAIRO", "REDEFINING LUXURY\nON THE NILE", "Welcome to Four Seasons Hotel Cairo at Nile Plaza"],
    [91, 180, "02 / 07", "A PRIVATE WORLD ABOVE THE CITY", "AN ELEVATED\nOASIS", "Experience breathtaking aerial perspectives of our resort-style outdoor pools nestled amidst the Cairo skyline."],
    [181, 270, "03 / 07", "WELLNESS, REIMAGINED", "SERENE INDOOR\nHEAVEN", "Step inside a glass-domed sanctuary designed for year-round tranquility and private relaxation."],
    [271, 380, "04 / 07", "CAIRO AFTER DARK", "ENCHANTING\nEVENINGS", "Immerse yourself in authentic oriental charm with handcrafted lanterns, poolside dining, and ambient night reflections."],
    [381, 490, "05 / 07", "A SENSE OF PLACE", "TIMELESS\nELEGANCE", "Wander through marble-paved corridors crafted with iconic Egyptian granite and timeless luxury details."],
    [491, 600, "06 / 07", "THE VIEW, YOURS ALONE", "UNRIVALED\nSUITE COMFORT", "Wake up to panoramic Nile views, plush interiors, and private balconies floating above the river."],
    [601, 711, "07 / 07", "THE ART OF ARRIVAL", "YOUR EXTRAORDINARY\nJOURNEY AWAITS", "Indulge in Cairo's most prestigious sanctuary."],
] as const;

function framePath(index: number) {
  return `/frames/frame_${String(index + 1).padStart(4, "0")}.webp`;
}

export default function Home() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sequenceRef = useRef<HTMLElement>(null);
    const [loaded, setLoaded] = useState(0);
    const [activeScene, setActiveScene] = useState(0);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
      const images: HTMLImageElement[] = [];
      let cancelled = false;
      let completed = 0;
      const updateProgress = () => {
        completed += 1;
        if (!cancelled) {
          setLoaded(completed);
          if (completed === FRAME_COUNT) setIsReady(true);
        }
      };
      for (let index = 0; index < FRAME_COUNT; index += 1) {
        const image = new Image();
        image.src = framePath(index);
        image.onload = updateProgress;
        image.onerror = updateProgress;
        images.push(image);
      }
      return () => { cancelled = true; images.forEach((image) => { image.onload = null; image.onerror = null; }); };
    }, []);

    useEffect(() => {
      if (!isReady || !canvasRef.current || !sequenceRef.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;
      const images = Array.from({ length: FRAME_COUNT }, (_, index) => { const image = new Image(); image.src = framePath(index); return image; });
      const frameState = { frame: 0 };
      let lastFrame = -1;
      const drawFrame = (frame: number) => {
        const image = images[frame];
        if (!image?.complete || !image.naturalWidth || frame === lastFrame) return;
        lastFrame = frame;
        const scale = Math.max(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
      };
      const resizeCanvas = () => {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(window.innerWidth * ratio);
        canvas.height = Math.floor(window.innerHeight * ratio);
        drawFrame(Math.round(frameState.frame));
      };
      const handleFrame = () => {
        const frame = Math.round(frameState.frame);
        drawFrame(frame);
        const nextScene = scenes.findIndex(([start, end]) => frame >= start && frame <= end);
        if (nextScene !== -1) setActiveScene(nextScene);
      };
      const contextScope = gsap.context(() => {
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        images[0].decode?.().catch(() => undefined).finally(() => drawFrame(0));
        gsap.to(frameState, { frame: FRAME_COUNT - 1, ease: "none", snap: "frame", onUpdate: handleFrame, scrollTrigger: { trigger: sequenceRef.current, start: "top top", end: "bottom bottom", scrub: 0.5, pin: ".sequence-stage", anticipatePin: 1 } });
      }, sequenceRef);
      return () => { window.removeEventListener("resize", resizeCanvas); contextScope.revert(); };
    }, [isReady]);

    const progress = Math.round((loaded / FRAME_COUNT) * 100);
    return (
      <main className="site-shell">
        {!isReady && <div className="preloader" aria-live="polite"><div className="preloader-mark">FS<span>NILE PLAZA</span></div><div className="preloader-bottom"><span>Preparing your arrival</span><span>{progress}%</span><div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div></div></div>}
        <header className="site-header"><a className="brand" href="#top" aria-label="Four Seasons Nile Plaza home"><img className="brand-logo" src="/logo.png" alt="Four Seasons Hotels and Resorts" /><span>HOTEL CAIRO AT NILE PLAZA</span></a><nav><a href="#experience">The experience</a><a href="#stay">Stay with us</a><a href="#contact">Contact</a></nav><a className="header-cta" href="#contact">Reserve <span>↗</span></a></header>
        <section id="experience" ref={sequenceRef} className="sequence" aria-label="Four Seasons Nile Plaza experience"><div className="sequence-stage"><canvas ref={canvasRef} aria-label="Cinematic view of Four Seasons Nile Plaza" /><div className="canvas-overlay" /><div className="scene-progress"><span>SCROLL TO EXPLORE</span><i /><span>CAIRO / 30.04° N</span></div>{scenes.map(([number, , , eyebrow, title, description], index) => <div className={`scene ${activeScene === index ? "scene-active" : ""}`} key={number}><p className="scene-eyebrow"><span>{number}</span>{eyebrow}</p><h1>{title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1><p className="scene-description">{description}</p>{index === 0 && <span className="scroll-cue">↓ &nbsp; Begin the journey</span>}{index === scenes.length - 1 && <a className="gold-button" href="#contact">Reserve your stay <span>↗</span></a>}</div>)}</div></section>
        <section id="stay" className="booking-section"><div className="section-kicker">THE NILE, YOUR WAY</div><div className="booking-grid"><div><h2>Arrive somewhere<br /><em>extraordinary.</em></h2><p className="section-lede">A stay shaped around the river, the city, and the art of making every moment feel entirely yours.</p></div><div className="booking-panel"><div className="panel-top"><span>PLAN YOUR STAY</span><span className="panel-line" /></div><a href="#contact" className="booking-row"><span>01</span><span>Check availability</span><span>↗</span></a><a href="#contact" className="booking-row"><span>02</span><span>Explore our rooms & suites</span><span>↗</span></a><a href="#contact" className="booking-row"><span>03</span><span>Meet your concierge</span><span>↗</span></a></div></div></section>
        <footer id="contact" className="site-footer"><div className="footer-top"><div className="footer-brand"><img className="brand-logo" src="/logo.png" alt="Four Seasons Hotels and Resorts" /><span>HOTEL CAIRO AT NILE PLAZA</span></div><div className="footer-invitation">Your Cairo story<br /><em>starts here.</em></div><a className="gold-button" href="mailto:concierge@fourseasons.com">Contact the concierge <span>↗</span></a></div><div className="footer-bottom"><span>35 GARDEN CITY STREET, CAIRO, EGYPT</span><span>© 2025 FOUR SEASONS HOTELS AND RESORTS</span><div><a href="#contact">Instagram</a><a href="#contact">Facebook</a><a href="#contact">Privacy</a></div></div></footer>
      </main>
    );
}
