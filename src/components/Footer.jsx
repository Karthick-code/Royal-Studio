import React from "react";
import { Link } from "react-router-dom";
import { Camera, Mail, Phone, Facebook, Instagram } from "lucide-react";

export const Footer = () => {
  return (
    <footer
      className="bg-[#0F0F0F] border-t border-[#2A2A2A] py-12 text-[#666] mt-auto"
      id="footer_container"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div>
            <div
              className="flex items-center mb-5 group select-none"
              id="footer_brand_logo_container"
            >
              <div
                className="flex items-center space-x-1.5"
                id="footer_segmented_brand_badge"
              >
                {/* Mullai Royal Studio Pill */}
                <div className="px-2.5 py-1 bg-[#141414]/80 border border-[#2A2A2A] rounded-lg flex flex-col justify-center items-center text-center shadow-md transition-all duration-300 group-hover:border-[#D4AF37]/30 group-hover:bg-[#D4AF37]/5">
                  <span className="font-serif italic text-xs font-medium text-[#F5F5F5] tracking-wide leading-tight">
                    Mullai
                  </span>
                  <span className="text-[#D4AF37] text-[7px] font-bold uppercase tracking-widest font-mono leading-none mt-0.5">
                    Royal Studio
                  </span>
                </div>

                {/* Amperstand Separator */}
                <div className="w-6 h-6 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-md flex items-center justify-center text-[#D4AF37] font-serif italic text-xs font-black shadow-inner transition-all duration-300 group-hover:bg-[#D4AF37]/20">
                  &
                </div>

                {/* Yugas Photography Pill */}
                <div className="px-2.5 py-1 bg-[#141414]/80 border border-[#2A2A2A] rounded-lg flex flex-col justify-center items-center text-center shadow-md transition-all duration-300 group-hover:border-[#D4AF37]/30 group-hover:bg-[#D4AF37]/5">
                  <span className="font-serif italic text-xs font-medium text-[#F5F5F5] tracking-wide leading-tight">
                    Yugas
                  </span>
                  <span className="text-[#D4AF37] text-[7px] font-bold uppercase tracking-widest font-mono leading-none mt-0.5">
                    Photography
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
              Fine aesthetics capturing irreplaceable human emotion. Two leading
              creative forces combined: expert wedding shoots, modern
              pre-weddings, cinematic videos, and customized portrait
              photography.
            </p>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#F5F5F5] mb-4 font-mono">
              Creative Works
            </h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li className="hover:text-[#D4AF37] cursor-default transition-colors">
                Pre-Wedding Romance
              </li>
              <li className="hover:text-[#D4AF37] cursor-default transition-colors">
                Wedding Photography
              </li>
              <li className="hover:text-[#D4AF37] cursor-default transition-colors">
                Birthday Captures
              </li>
              <li className="hover:text-[#D4AF37] cursor-default transition-colors">
                House Warming
              </li>
              <li className="hover:text-[#D4AF37] cursor-default transition-colors">
                Baby Shower
              </li>
              <li className="hover:text-[#D4AF37] cursor-default transition-colors">
                Album Designing
              </li>
              <li className="hover:text-[#D4AF37] cursor-default transition-colors">
                Editorial Portrait Sessions
              </li>
              <li className="hover:text-[#D4AF37] cursor-default transition-colors">
                Cinematic Reels & Video Edits
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#F5F5F5] mb-4 font-mono">
              Contact Details
            </h4>
            <ul className="space-y-3 text-xs text-gray-500">
              <li className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <Instagram className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                  <a
                    href="https://www.instagram.com/mullai.royalstudio?igsh=MTllbjBjdGt1MGcxZg=="
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#D4AF37] transition-colors"
                  >
                    @Mullai Royal studio
                  </a>
                </div>
                <div className="flex items-center space-x-2 pl-5.5">
                  <a
                    href="https://www.instagram.com/yugans.visuals?igsh=YTdhYW1waXptZ2V3"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#D4AF37] transition-colors"
                  >
                    @Yuvan visuals
                  </a>
                </div>
              </li>
              {/* <li className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <Facebook className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                  <a href="https://facebook.com/mullai_royal_studio" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">Mullai Royal Studio</a>
                </div>
                <div className="flex items-center space-x-2 pl-5.5">
                  <a href="https://facebook.com/yugas_photography" target="_blank" rel="noopener noreferrer" className="hover:text-[#D4AF37] transition-colors">Yugas Photography</a>
                </div>
              </li> */}
              <li className="flex items-center space-x-2">
                <Phone className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                <span>+91 99988 88899</span>
              </li>
              {/* <li className="flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />
                <span>Mullairoyalstudio26@gmail.com</span>
                <span>yugasphotography26@gmail.com</span>
              </li>*/}
              <li className="flex items-start space-x-2"> 
                <Mail className="h-3.5 w-3.5 text-[#D4AF37] shrink-0" />

                <div className="flex flex-col">
                  <span className="break-all">
                    Mullairoyalstudio26@gmail.com
                  </span>
                  <span className="break-all">
                    yugasphotography26@gmail.com
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#2A2A2A] pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-600">
          <p>
            © {new Date().getFullYear()} Mullai Royal Studio & Yugas
            Photography. All rights reserved.
          </p>
          <p className="mt-2 sm:mt-0 font-mono tracking-widest text-[#666] text-[10px] uppercase">
            Artistic Portal v1.0 • Modern Glass
          </p>
        </div>
      </div>
    </footer>
  );
};
