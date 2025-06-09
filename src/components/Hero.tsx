import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import logo from "/assets/logo.svg";

const Hero = () => {

  return (
    <div className="text-center pb-6 sm:pb-8 px-2 sm:px-4">
      <img 
        src={logo} 
        alt="AiCuity" 
        className="w-[200px] sm:w-[200px] md:w-[300px] lg:w-[400px] mx-auto transition-opacity duration-200" 
      />
      <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto px-2 leading-relaxed">
        Read faster and improve your reading speed with content from websites or files.
      </p>
      <p className="mt-2 sm:mt-3 text-lg sm:text-xl italic text-gray-700 dark:text-gray-200 px-2">
        "Blink and You've Read It!"
      </p>
    </div>
  );
};

export default Hero;
