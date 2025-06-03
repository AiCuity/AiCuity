const Hero = () => {
  return (
    <div className="text-center pb-6 sm:pb-8 px-2 sm:px-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 leading-tight">
        AiCuity
      </h1>
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
