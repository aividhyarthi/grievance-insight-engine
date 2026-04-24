export default function Banner() {
  return (
    <section className="relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/5876503/pexels-photo-5876503.jpeg?auto=compress&cs=tinysrgb&w=1400&h=600&fit=crop"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-cta opacity-85" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.12),transparent_50%)]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20 sm:py-28">
        <div className="animate-on-scroll max-w-3xl mx-auto text-center text-white">
          <p className="font-display text-lg sm:text-xl italic text-white/70 mb-6">
            You don&apos;t have to navigate this alone.
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
            Care that listens,
            <br />
            understands, and stays.
          </h2>
          <p className="mt-6 text-lg sm:text-xl text-white/70 leading-relaxed max-w-2xl mx-auto">
            The first fully integrated platform for personalised midlife care — combining
            medical expertise, emotional understanding, and continuous support.
          </p>
          <a
            href="/contact"
            className="group inline-flex items-center justify-center mt-10 px-10 py-5 rounded-full text-lg font-semibold bg-white text-rose-dark hover:bg-cream transition-colors shadow-xl"
          >
            Join the Waiting List
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
