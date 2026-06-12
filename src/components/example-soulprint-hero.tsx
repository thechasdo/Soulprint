export function SoulprintHero() {
  return (
    <section className="sp-page px-6 py-20">
      <div className="mx-auto max-w-6xl sp-card">
        <p className="sp-eyebrow">Soulprint - Memories Live On</p>
        <h1 className="sp-hero-title mt-4">
          Build one beautiful <span className="sp-gradient-text">Soulprint Home</span>.
        </h1>
        <p className="sp-story-copy mt-6 max-w-2xl">
          Preserve stories, photographs, voice notes, milestones, and the little details that keep a life close.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a className="sp-button-primary" href="/create">Create a Soulprint</a>
          <a className="sp-button-secondary" href="/about">Learn More</a>
        </div>
        <p className="sp-parent-endorsement mt-10">Created by Chasdo Creative Worldwide LLC</p>
      </div>
    </section>
  );
}
