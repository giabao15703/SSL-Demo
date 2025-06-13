"use client";

import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperClass } from "swiper";
import { Mousewheel, Keyboard } from "swiper/modules";
import "swiper/css";
import "swiper/css/mousewheel";
import "swiper/css/keyboard";

import Section4 from "@/components/section4";
import { Section1, Section3 } from "@/components";
import gsap from "gsap"; // Đảm bảo GSAP đã được cài đặt

export default function Home() {
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const synth = window.speechSynthesis;
    const updateVoices = () => {
      voicesRef.current = synth.getVoices();
      setReady(true);
    };
    synth.addEventListener("voiceschanged", updateVoices);
    updateVoices();
    return () => synth.removeEventListener("voiceschanged", updateVoices);
  }, []);

  const slides = [
    {
      Comp: Section1,
      text: "Welcome to Section One!",
      voiceName: "Section One",
    },
    {
      Comp: Section3,
      text: "Here is Section Two.",
      voiceName: "Section Two",
    },
    {
      Comp: Section4,
      text: "Finally, Section Three.",
      voiceName: "Section Three",
    },
  ];

  const swiperRef = useRef<SwiperClass | null>(null);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const speakText = (text: string, voiceName: string) => {
    const synth = window.speechSynthesis;
    synth.cancel(); // Dừng bất kỳ giọng nói nào đang phát
    const utt = new SpeechSynthesisUtterance(text);
    const match = voicesRef.current.find((v) => v.name.includes(voiceName));
    if (match) utt.voice = match;
    utt.rate = 1;
    utt.pitch = 1;
    utt.volume = 1;

    // Sau khi giọng nói kết thúc, tự động chuyển slide
    utt.onend = () => {
      // Chuyển sang slide tiếp theo
      if (swiperRef.current) {
        swiperRef.current.slideNext();
      }
    };

    synth.speak(utt);
  };

  const onSlideChange = (sw: SwiperClass) => {
    setIdx(sw.activeIndex);
    if (playing && ready) {
      const { text, voiceName } = slides[sw.activeIndex];
      speakText(text, voiceName); // Bắt đầu phát giọng nói ngay sau khi chuyển slide
    }
  };

  const togglePlay = () => {
    if (!ready) return;
    if (!playing) {
      const { text, voiceName } = slides[idx];
      speakText(text, voiceName);
      setPlaying(true);
    } else {
      window.speechSynthesis.cancel();
      setPlaying(false);
    }
  };

  const goPrev = () => {
    swiperRef.current?.slidePrev();
    setPlaying(false); // Dừng giọng nói khi chuyển slide thủ công
  };
  const goNext = () => {
    swiperRef.current?.slideNext();
    setPlaying(false); // Dừng giọng nói khi chuyển slide thủ công
  };

  // GSAP Hover Effect for Smoothness
  useEffect(() => {
    const container = document.querySelector(".rounded-container");

    if (container) {
      container.addEventListener("mouseenter", (event) => {
        const containerRect = container.getBoundingClientRect();
        const mouseX = (event as MouseEvent).clientX;
        const centerX = containerRect.left + containerRect.width / 2;

        // Nếu chuột nằm bên trái của phần tử, nghiêng sang trái, ngược lại nghiêng sang phải
        const direction = mouseX < centerX ? -1 : 1;

        gsap.to(container, {
          scale: 1.05,
          rotation: direction * 3,
          boxShadow: "0px 0px 25px rgba(0, 255, 255, 0.8)",
          duration: 0.5,
          ease: "power2.out",
        });
      });

      container.addEventListener("mouseleave", () => {
        gsap.to(container, {
          scale: 1,
          rotation: 0,
          boxShadow: "0 0 15px rgba(0, 255, 255, 0.7)",
          duration: 0.5,
          ease: "power2.in",
        });
      });
    }
  }, []);

  return (
    <div className="relative">
      <Swiper
        onSwiper={(sw) => (swiperRef.current = sw)}
        direction="vertical"
        slidesPerView={1}
        mousewheel
        keyboard
        modules={[Mousewheel, Keyboard]}
        onSlideChange={onSlideChange}
        speed={1000} // Tốc độ chuyển slide (theo miligiây)
        parallax={true} // Thêm hiệu ứng parallax mượt mà
        style={{ height: "100vh" }}
      >
        {slides.map(({ Comp }, i) => (
          <SwiperSlide key={i}>
            <Comp />
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        className="rounded-container"
        style={{
          border: "2px solid transparent",
          borderRadius: "50px",
          backgroundClip: "border-box",
          animation: "pulseBorder 2s infinite",
        }}
      >
        <button onClick={togglePlay} className="play-button hover:bg-gray-700">
          {playing ? "⏸️" : "▶️"}
        </button>

        <button onClick={goPrev} className="icon-button hover:bg-gray-700">
          ⏮
        </button>

        <span className="voice-name">{slides[idx].voiceName}</span>

        <button onClick={goNext} className="icon-button hover:bg-gray-700">
          ⏭
        </button>
      </div>
    </div>
  );
}
