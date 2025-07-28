import { Typewriter } from 'react-simple-typewriter';

export const Hero = () => {
  return (
    <section className="text-center py-16">
      {/* Typewriter effect with gradient and bold text */}
      <h2
        className="text-3xl mb-4"
        style={{
          backgroundImage: 'linear-gradient(to right, #A855F7, #3B82F6)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block',
          fontWeight: 'bold' // Add bold weight here  
        }}
      >
        <Typewriter
          words={['Welcome! User']}
          loop={1}
          cursor
          cursorStyle='_'
          typeSpeed={70}
          deleteSpeed={50}
          delaySpeed={1000}
        />
      </h2>

      <h1 className="text-4xl font-bold text-purple-800 mb-4">
        Extract Invoice Data in Seconds
      </h1>

      <p className="text-gray-600 text-xl mb-8">
        Automate your invoice processing with AI-powered extraction
      </p>

      {/* <button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-md"> */}
      <button className="bg-gradient-to-r from-purple-600 to-blue-500 text-white px-8 py-3 rounded-full hover:opacity-90 transition-opacity shadow-md">

        Get Started
      </button>
    </section>
  );
};  