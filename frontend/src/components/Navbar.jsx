import { LayoutTemplate } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import {ProfileInfoCard} from "./Cards";
import InterSume from "../assets/InterSume.png";

const Navbar = () => {
  return (
    <div className="h-24 bg-white/70 backdrop-blur-xl border-b border-violet-100/50 py-2.5 px-4 md:px-0 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-5">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-18 h-18 flex items-center justify-center">
            <img src={InterSume} alt="InterSume Logo" className="w-18 h-18" />
          </div>
        </Link>
        <ProfileInfoCard />
      </div>
    </div>
  );
};

export default Navbar;
