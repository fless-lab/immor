import Link from "next/link";

export default function ProjectsPage() {
  const projects = [
    {
      id: "familiale",
      title: "Villa Évolutive R+2",
      type: "Familiale",
      location: "Agovodou, Lomé",
      area: "300 m²",
      status: "Esquisse",
      href: "/familiale",
      gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
      border: "hover:border-emerald-500/50",
      accent: "text-emerald-400",
      bgAccent: "bg-emerald-500/10",
    },
    // Future projects can be added here
    {
      id: "future-1",
      title: "Résidence Horizon",
      type: "Locatif",
      location: "Adidogomé, Lomé",
      area: "450 m²",
      status: "En attente",
      href: "#",
      gradient: "from-blue-500/20 via-blue-500/5 to-transparent",
      border: "hover:border-blue-500/50",
      accent: "text-blue-400",
      bgAccent: "bg-blue-500/10",
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-50 font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-24 sm:py-32">
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-neutral-400 mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Portefeuille Immobilier
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6">
            Mes Projets <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
              Immobiliers
            </span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl leading-relaxed">
            Consultez les plans détaillés, les descriptions et l'avancement de vos biens immobiliers. Sélectionnez un projet ci-dessous pour l'explorer.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link 
              key={project.id} 
              href={project.href}
              className={`group relative flex flex-col justify-between h-[340px] rounded-3xl p-8 bg-[#111111] border border-white/5 ${project.border} transition-all duration-500 hover:-translate-y-2 overflow-hidden`}
            >
              {/* Card Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-b ${project.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${project.bgAccent} ${project.accent}`}>
                    {project.type}
                  </span>
                  
                  {project.status === "Esquisse" ? (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                      {project.status}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      {project.status}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-neutral-400 transition-all">
                    {project.title}
                  </h3>
                  
                  <div className="flex flex-col gap-2 mt-4 text-sm text-neutral-400">
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                      {project.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 12h16"/><path d="M12 4v16"/></svg>
                      {project.area}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="relative z-10 mt-auto pt-6 flex items-center gap-3 text-sm font-medium text-white opacity-60 group-hover:opacity-100 transition-opacity">
                <span>Voir le plan web</span>
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all group-hover:translate-x-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
