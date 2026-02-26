import Layout from "@/components/Layout";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, Users, Skull, ArrowRight } from "lucide-react";

const TERMINAL_LINES = [
  { text: "$ sudo ./hackverse-access --request-join", delay: 0, type: "command" as const },
  { text: "[*] Initializing secure connection...", delay: 800, type: "info" as const },
  { text: "[✓] TLS 1.3 handshake complete", delay: 1600, type: "success" as const },
  { text: "$ whoami", delay: 2200, type: "command" as const },
  { text: "guest@hackverse ~ $", delay: 2600, type: "output" as const },
  { text: "[*] Running identity verification...", delay: 3200, type: "info" as const },
  { text: "$ nmap -sV --script=auth-check localhost", delay: 3800, type: "command" as const },
  { text: "[✓] Port 443/tcp  open  https", delay: 4600, type: "success" as const },
  { text: "[✓] Port 6667/tcp open  discord-irc", delay: 5000, type: "success" as const },
  { text: "[*] Checking validations...", delay: 5600, type: "info" as const },
  { text: "$ cat /etc/hackverse/permissions.conf", delay: 6200, type: "command" as const },
  { text: "  ALLOW_JOIN=true", delay: 6600, type: "output" as const },
  { text: "  ROLE=recruit", delay: 6900, type: "output" as const },
  { text: "  CLEARANCE=granted", delay: 7200, type: "output" as const },
  { text: "[✓] All validations passed", delay: 7800, type: "success" as const },
  { text: "$ curl -X POST https://discord.com/api/invite --generate", delay: 8400, type: "command" as const },
  { text: "[*] Generating secure invite link...", delay: 9200, type: "info" as const },
  { text: "[✓] Invite token created successfully", delay: 10000, type: "success" as const },
  { text: "", delay: 10600, type: "done" as const },
];

function TerminalLine({ line }: { line: typeof TERMINAL_LINES[0] }) {
  const colorMap = {
    command: "text-green-400",
    info: "text-cyan-400",
    success: "text-green-500",
    output: "text-foreground/70",
    done: "",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15 }}
      className={`font-mono text-xs sm:text-sm leading-6 ${colorMap[line.type]}`}
    >
      {line.text}
    </motion.div>
  );
}

export default function CommunityPage() {
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [visibleLines, setVisibleLines] = useState<typeof TERMINAL_LINES>([]);
  const [showInvite, setShowInvite] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const startTerminal = useCallback(() => {
    setTerminalOpen(true);
    setVisibleLines([]);
    setShowInvite(false);

    // Clear any previous timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    TERMINAL_LINES.forEach((line) => {
      const timer = setTimeout(() => {
        if (line.type === "done") {
          setShowInvite(true);
        } else {
          setVisibleLines((prev) => [...prev, line]);
        }
      }, line.delay);
      timersRef.current.push(timer);
    });
  }, []);

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [visibleLines, showInvite]);

  // Replace this with your actual Discord invite link
  const DISCORD_INVITE = "https://discord.gg/hackverse";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 text-sm font-mono text-primary mb-4">
            <Skull className="w-4 h-4" />
            <span>~/hackverse/community</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
            Join the <span className="text-gradient-cyan">Hackverse</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            A private community of hackers, builders, and security researchers. 
            Request access below.
          </p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { icon: Users, label: "Members", value: "500+" },
            { icon: Shield, label: "CTFs Won", value: "42" },
            { icon: Terminal, label: "Writeups", value: "200+" },
          ].map((s) => (
            <div key={s.label} className="glass-panel rounded-xl p-4 text-center">
              <s.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Request to Join button */}
        <AnimatePresence mode="wait">
          {!terminalOpen ? (
            <motion.div
              key="button"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <button
                onClick={startTerminal}
                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 border border-primary/30 glow-cyan"
                style={{
                  background: "linear-gradient(135deg, hsl(var(--primary) / 0.15), hsl(var(--glow-purple) / 0.1))",
                }}
              >
                <span className="relative z-10 flex items-center gap-3 text-primary">
                  <Terminal className="w-5 h-5" />
                  Request to Join
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              <p className="text-xs text-muted-foreground mt-3 font-mono">
                sudo access required
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="terminal"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Terminal window */}
              <div className="rounded-2xl overflow-hidden border border-green-500/20 shadow-[0_0_40px_-10px_hsl(var(--glow-cyan)/0.3)]">
                {/* Title bar */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-green-500/10" style={{ background: "hsl(140 30% 6%)" }}>
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-xs font-mono text-green-500/60 ml-2">hackverse@terminal ~ bash</span>
                </div>

                {/* Terminal body */}
                <div
                  ref={terminalRef}
                  className="p-4 sm:p-6 max-h-[400px] overflow-y-auto"
                  style={{ background: "hsl(140 20% 4%)" }}
                >
                  {visibleLines.map((line, i) => (
                    <TerminalLine key={i} line={line} />
                  ))}

                  {/* Blinking cursor while running */}
                  {!showInvite && visibleLines.length > 0 && (
                    <span className="inline-block w-2 h-4 bg-green-400 animate-pulse mt-1" />
                  )}

                  {/* Invite result */}
                  <AnimatePresence>
                    {showInvite && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mt-6 pt-4 border-t border-green-500/20"
                      >
                        <div className="font-mono text-sm text-green-400 mb-1">
                          ╔══════════════════════════════════════╗
                        </div>
                        <div className="font-mono text-sm text-green-400 mb-1">
                          ║  ACCESS GRANTED — Welcome, recruit  ║
                        </div>
                        <div className="font-mono text-sm text-green-400 mb-4">
                          ╚══════════════════════════════════════╝
                        </div>
                        <a
                          href={DISCORD_INVITE}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 hover:scale-105 border border-green-500/40 text-green-400 hover:text-green-300"
                          style={{
                            background: "linear-gradient(135deg, hsl(140 50% 15% / 0.8), hsl(140 40% 10% / 0.8))",
                            boxShadow: "0 0 20px -5px hsl(140 80% 50% / 0.3)",
                          }}
                        >
                          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                          </svg>
                          Join Hackverse Discord
                          <ArrowRight className="w-4 h-4" />
                        </a>
                        <p className="font-mono text-xs text-green-500/50 mt-3">
                          $ echo "See you on the other side."
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Reset button */}
              {showInvite && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  onClick={() => {
                    setTerminalOpen(false);
                    setVisibleLines([]);
                    setShowInvite(false);
                  }}
                  className="mt-4 text-xs text-muted-foreground hover:text-foreground font-mono mx-auto block transition-colors"
                >
                  [reset terminal]
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
