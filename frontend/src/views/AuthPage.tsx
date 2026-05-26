import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";

type Mode = "login" | "register";

export function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response =
        mode === "login" ? await api.login(payload) : await api.register(payload);
      setMessage(response.message);
      event.currentTarget.reset();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Unable to continue.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.2fr_520px]">
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1800&q=80"
          alt="Esports stage"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black/70 to-cyan/10" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <div>
            <p className="font-display text-3xl tracking-[0.22em]">FRAGGED</p>
            <p className="mt-3 max-w-md text-white/60">
              A premium fantasy esports command center inspired by live arena energy and elite competition software.
            </p>
          </div>
          <div className="max-w-xl">
            <p className="text-xs uppercase tracking-[0.34em] text-cyan/70">Platform Preview</p>
            <h1 className="mt-3 font-display text-6xl leading-none">
              Draft teams.
              <span className="block text-cyan">Track live points.</span>
              <span className="block text-green">Climb the ladder.</span>
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-card backdrop-blur-xl"
        >
          <div className="flex gap-2 rounded-full border border-white/10 bg-black/25 p-1">
            {(["login", "register"] as Mode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold capitalize transition ${
                  mode === item ? "bg-cyan text-black" : "text-white/60"
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="mt-8">
            <p className="text-xs uppercase tracking-[0.34em] text-cyan/70">{mode === "login" ? "Welcome Back" : "Create Account"}</p>
            <h2 className="mt-3 font-display text-4xl">
              {mode === "login" ? "Enter the arena" : "Join the circuit"}
            </h2>
            <p className="mt-3 text-sm text-white/55">
              Session auth is wired to the servlet backend. Submit against Tomcat once the API is deployed.
            </p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {mode === "register" ? (
              <>
                <Input name="username" placeholder="Username" />
                <Input name="favoriteGame" placeholder="Favorite Game (VALORANT/FORTNITE/ROCKET_LEAGUE)" />
                <Input name="avatarUrl" placeholder="Avatar URL (optional)" />
                <Input name="bio" placeholder="Bio" />
              </>
            ) : null}
            <Input name="email" placeholder="Email" type="email" />
            <Input name="password" placeholder="Password" type="password" />

            {error ? <p className="rounded-2xl border border-magenta/25 bg-magenta/10 px-4 py-3 text-sm text-magenta">{error}</p> : null}
            {message ? <p className="rounded-2xl border border-green/25 bg-green/10 px-4 py-3 text-sm text-green">{message}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-cyan to-sky-500 px-4 py-4 text-sm font-bold uppercase tracking-[0.18em] text-black disabled:opacity-70"
            >
              {loading ? "Processing..." : mode === "login" ? "Login" : "Register"}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

function Input({ name, placeholder, type = "text" }: { name: string; placeholder: string; type?: string }) {
  return (
    <input
      name={name}
      type={type}
      placeholder={placeholder}
      className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-cyan/40"
    />
  );
}
