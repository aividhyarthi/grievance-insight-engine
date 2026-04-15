export default function Footer() {
  return (
    <footer className="bg-foreground text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <span className="text-2xl font-display font-bold">
              Her<span className="text-rose-light">Midlife</span>
            </span>
            <p className="mt-4 text-sm text-white/40 leading-relaxed max-w-xs">
              Australia&apos;s first fully integrated platform for personalised midlife care.
              Because every woman deserves to be heard.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white/60 mb-4 text-sm uppercase tracking-wider">Care</h4>
            <ul className="space-y-3 text-sm text-white/40">
              <li><a href="/#services" className="hover:text-white transition-colors">What We Treat</a></li>
              <li><a href="/#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="/#why-us" className="hover:text-white transition-colors">Why HerMidlife</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white/60 mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3 text-sm text-white/40">
              <li><a href="/team" className="hover:text-white transition-colors">Our Team</a></li>
              <li><a href="/#b2b" className="hover:text-white transition-colors">For Employers</a></li>
              <li><a href="/events/perimenopause-point-cook" className="hover:text-white transition-colors">Events</a></li>
              <li><a href="/investors" className="hover:text-white transition-colors">Investors</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white/60 mb-4 text-sm uppercase tracking-wider">Get in Touch</h4>
            <ul className="space-y-3 text-sm text-white/40">
              <li>
                <a href="mailto:listen@hermidlife.org" className="hover:text-white transition-colors">
                  listen@hermidlife.org
                </a>
              </li>
              <li>Melbourne, Australia</li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/25">
            &copy; {new Date().getFullYear()} HerMidlife. All rights reserved.
          </p>
          <p className="text-xs text-white/25">
            Built with care for Australian women.
          </p>
        </div>
      </div>
    </footer>
  );
}
