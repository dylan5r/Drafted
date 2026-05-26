import { motion } from "framer-motion";
import { SectionTitle } from "@/ui/SectionTitle";
import type { BuilderPlayer, MatchCard, TeamCard } from "@/types";

const matches: MatchCard[] = [
  { id: 1, title: "Sentinels vs Fnatic", subtitle: "VCT Masters Madrid", status: "Live • Map 2", highlight: "TenZ leading with 245 pts" },
  { id: 2, title: "Bugha & Mero", subtitle: "FNCS Grand Finals", status: "Live • Session 1", highlight: "1st place pace, 85 pts" },
  { id: 3, title: "BDS vs Vitality", subtitle: "RLCS Major", status: "Tomorrow • 7:00 PM", highlight: "Projected 5-game thriller" },
];

const teams: TeamCard[] = [
  { id: 1, game: "VALORANT", name: "Aim Demons", points: 1245.5, rankLabel: "Top 4%" },
  { id: 2, game: "FORTNITE", name: "Storm Surge", points: 1018.2, rankLabel: "Top 9%" },
  { id: 3, game: "ROCKET_LEAGUE", name: "Octane Theory", points: 894.7, rankLabel: "Top 12%" },
];

const players: BuilderPlayer[] = [
  { id: 1, handle: "TenZ", team: "SEN", role: "Duelist", salary: 12500, trend: "+1.2%", rarity: "LEGENDARY", average: 24.5, avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" },
  { id: 2, handle: "Derke", team: "FNC", role: "Duelist", salary: 11200, trend: "+0.8%", rarity: "EPIC", average: 22.1, avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80" },
  { id: 3, handle: "Chronicle", team: "FNC", role: "Flex", salary: 9600, trend: "+0.6%", rarity: "RARE", average: 18.8, avatarUrl: "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=300&q=80" },
  { id: 4, handle: "Crashies", team: "NRG", role: "Initiator", salary: 9500, trend: "-0.4%", rarity: "EPIC", average: 17.4, avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80" },
];

const rarityStyles = {
  LEGENDARY: "border-yellow-500/35 from-yellow-500/10",
  EPIC: "border-fuchsia-500/35 from-fuchsia-500/10",
  RARE: "border-sky-500/35 from-sky-500/10",
};

export function DashboardPage() {
  return (
    <main className="min-h-screen px-4 py-6 lg:px-8">
      <div className="mx-auto flex max-w-[1540px] flex-col gap-6">
        <header className="rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-card backdrop-blur-xl lg:p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan to-sky-500 text-lg font-black text-black shadow-cyan">
                F
              </div>
              <div>
                <p className="font-display text-xl tracking-[0.28em] text-white/95">FRAGGED</p>
                <p className="text-sm text-white/45">Fantasy esports at tournament pace</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {["Valorant", "Fortnite", "Rocket League"].map((label, index) => (
                <button
                  key={label}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    index === 0
                      ? "border-cyan/40 bg-cyan/15 text-cyan shadow-cyan"
                      : "border-white/10 bg-black/20 text-white/60 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Global Rank</p>
                <p className="font-display text-lg text-green">#4,291</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-[0.24em] text-white/40">Wallet</p>
                <p className="font-display text-lg text-cyan">12,500 VP</p>
              </div>
              <img
                className="h-12 w-12 rounded-2xl border border-cyan/40 object-cover"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80"
                alt="Player avatar"
              />
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-card backdrop-blur-xl lg:block">
            <p className="mb-4 text-xs uppercase tracking-[0.34em] text-white/35">Menu</p>
            <nav className="space-y-2">
              {["Dashboard", "Team Builder", "Leagues", "Leaderboards", "Rewards"].map((item, index) => (
                <a
                  key={item}
                  href="#"
                  className={`flex rounded-2xl border px-4 py-3 text-sm font-medium transition ${
                    index === 0
                      ? "border-cyan/35 bg-cyan/10 text-white"
                      : "border-transparent bg-black/10 text-white/60 hover:border-white/10 hover:text-white"
                  }`}
                >
                  {item}
                </a>
              ))}
            </nav>
            <div className="mt-8 rounded-[24px] border border-cyan/20 bg-gradient-to-br from-cyan/15 to-transparent p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-cyan/70">Featured Slate</p>
              <h3 className="mt-2 font-display text-xl">VCT Masters Madrid</h3>
              <p className="mt-2 text-sm text-white/55">Lock your roster before the group stage starts.</p>
              <button className="mt-5 w-full rounded-2xl bg-gradient-to-r from-cyan to-sky-500 px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] text-black">
                Build Roster
              </button>
            </div>
          </aside>

          <div className="space-y-6">
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.8fr)_420px]">
              <motion.article
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-[32px] border border-white/10 bg-black/35 p-8 shadow-card backdrop-blur-xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1800&q=80"
                  alt="Esports arena"
                  className="absolute inset-0 h-full w-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/30" />
                <div className="absolute -left-12 top-8 h-32 w-32 rounded-full bg-cyan/15 blur-3xl" />
                <div className="relative z-10 max-w-2xl">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-magenta/35 bg-magenta/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-magenta">
                    Live Now
                  </div>
                  <h1 className="font-display text-4xl leading-none md:text-6xl">
                    Masters Madrid
                    <span className="block bg-gradient-to-r from-cyan to-sky-400 bg-clip-text text-transparent">
                      Fantasy Challenge
                    </span>
                  </h1>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-white/60 md:text-base">
                    Premium fantasy contests for Valorant, Fortnite, and Rocket League with polished live scoring,
                    elite roster tools, and competitive progression.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-4">
                    <button className="rounded-2xl bg-gradient-to-r from-cyan to-sky-500 px-6 py-3 text-sm font-bold uppercase tracking-[0.18em] text-black shadow-cyan">
                      Draft Team
                    </button>
                    <button className="rounded-2xl border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/85">
                      View Tournament
                    </button>
                  </div>
                </div>
              </motion.article>

              <article className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur-xl">
                <SectionTitle eyebrow="Pulse" title="Live Feed" />
                <div className="mt-6 space-y-4">
                  {matches.map((match) => (
                    <div key={match.id} className="rounded-3xl border border-white/10 bg-black/25 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-white">{match.title}</p>
                        <span className="rounded-full border border-magenta/25 bg-magenta/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-magenta">
                          {match.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/35">{match.subtitle}</p>
                      <p className="mt-4 text-sm text-white/65">{match.highlight}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur-xl">
              <SectionTitle eyebrow="Portfolio" title="My Fantasy Teams">
                <button className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/60">
                  See all
                </button>
              </SectionTitle>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {teams.map((team) => (
                  <div key={team.id} className="rounded-[26px] border border-white/10 bg-black/30 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-cyan/70">{team.game.split("_").join(" ")}</p>
                    <h3 className="mt-2 font-display text-2xl">{team.name}</h3>
                    <div className="mt-6 space-y-2 text-sm">
                      <div className="flex justify-between text-white/55">
                        <span>Total Points</span>
                        <span className="font-display text-white">{team.points}</span>
                      </div>
                      <div className="flex justify-between text-white/55">
                        <span>Global Rank</span>
                        <span className="font-display text-green">{team.rankLabel}</span>
                      </div>
                    </div>
                    <button className="mt-6 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85">
                      Manage Roster
                    </button>
                  </div>
                ))}
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[26px] border border-dashed border-cyan/30 bg-cyan/5 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan/25 bg-black/20 text-2xl text-cyan">
                    +
                  </div>
                  <h3 className="mt-5 font-display text-xl">Create New Team</h3>
                  <p className="mt-2 max-w-[220px] text-sm text-white/45">Draft another tournament-ready lineup in seconds.</p>
                </div>
              </div>
            </section>

            <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-card backdrop-blur-xl">
              <SectionTitle eyebrow="Core Experience" title="Team Builder" />
              <div className="mt-6 flex flex-wrap gap-4 rounded-[24px] border border-white/10 bg-black/25 p-4">
                {[
                  { label: "Salary Cap", value: "$50,000", accent: "text-white" },
                  { label: "Remaining", value: "$12,400", accent: "text-green" },
                  { label: "Proj. Pts", value: "485.2", accent: "text-cyan" },
                ].map((stat) => (
                  <div key={stat.label} className="min-w-[160px] flex-1 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/35">{stat.label}</p>
                    <p className={`mt-2 font-display text-2xl ${stat.accent}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_440px]">
                <div className="rounded-[28px] border border-white/10 bg-black/20">
                  <div className="border-b border-white/10 p-4">
                    <input
                      className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm outline-none transition placeholder:text-white/25 focus:border-cyan/40"
                      placeholder="Search players by name, team, role, or game"
                    />
                    <div className="mt-3 flex gap-2 overflow-x-auto">
                      {["All Roles", "Duelist", "Initiator", "Controller", "Sentinel", "Flex"].map((filter, index) => (
                        <button
                          key={filter}
                          className={`rounded-full border px-3 py-2 text-xs font-medium ${
                            index === 0
                              ? "border-cyan/30 bg-cyan/15 text-cyan"
                              : "border-white/10 bg-white/5 text-white/55"
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3 p-3">
                    {players.map((player) => (
                      <div
                        key={player.id}
                        className={`rounded-[24px] border bg-gradient-to-b to-transparent p-4 ${rarityStyles[player.rarity]} border-white/10`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <img className="h-14 w-14 rounded-2xl object-cover" src={player.avatarUrl} alt={player.handle} />
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-display text-lg">{player.handle}</h4>
                                <span className="rounded-full border border-white/10 bg-black/25 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-white/50">
                                  {player.team}
                                </span>
                              </div>
                              <p className="text-sm text-white/55">
                                {player.role} • Avg {player.average} pts
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-display text-lg">${player.salary.toLocaleString()}</p>
                            <p className={`text-xs ${player.trend.startsWith("+") ? "text-green" : "text-magenta"}`}>
                              {player.trend} trend
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-2xl">Current Roster</h3>
                    <button className="rounded-full border border-cyan/25 bg-cyan/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan">
                      Optimize Team
                    </button>
                  </div>
                  <div className="mt-6 space-y-3">
                    {["Demon1", "Crashies", "Marved"].map((player, index) => (
                      <div key={player} className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-display text-lg">{player}</p>
                            <p className="text-sm text-white/50">
                              {index === 0 ? "Duelist • $13,000" : index === 1 ? "Initiator • $9,500" : "Controller • $8,200"}
                            </p>
                          </div>
                          <button className="text-sm text-white/35 hover:text-magenta">Remove</button>
                        </div>
                      </div>
                    ))}
                    {["Select Sentinel", "Select Flex"].map((slot) => (
                      <div
                        key={slot}
                        className="flex h-[82px] items-center justify-center rounded-[24px] border border-dashed border-white/15 bg-transparent text-sm text-white/35"
                      >
                        {slot}
                      </div>
                    ))}
                  </div>
                  <button className="mt-6 w-full rounded-2xl bg-gradient-to-r from-cyan to-sky-500 px-4 py-4 text-sm font-bold uppercase tracking-[0.18em] text-black">
                    Submit Roster
                  </button>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
