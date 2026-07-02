/**
 * siblings.js
 *
 * The rest of the -chan family. Each is its own deployed site.
 * `current: true` marks the one the visitor is already on, so the
 * panel can show a "you're here" state instead of a dead link.
 */
const SIBLING_SITES = [
  {
    id: 'java',
    name: 'Java-chan',
    tagline: 'Write once, run everywhere (eventually)',
    url: 'https://java-chan.vercel.app',
    accent: '#e76f00',
    current: true,
  },
  {
    id: 'cpp',
    name: 'C++-chan',
    tagline: 'Fast, powerful, dangerously sharp',
    url: 'https://plusplus-chan.vercel.app',
    accent: '#659ad2',
  },
  {
    id: 'rust',
    name: 'Rust-chan',
    tagline: 'Memory-safe and fiercely independent',
    url: 'https://rust-chan.vercel.app',
    accent: '#dea584',
  },
  {
    id: 'go',
    name: 'Go-chan',
    tagline: 'Simple, concurrent, gopher-approved',
    url: 'https://go-chan.vercel.app',
    accent: '#00add8',
  },
  {
    id: 'kotlin',
    name: 'Kotlin-chan',
    tagline: "Java's cooler younger cousin",
    url: 'https://kotlin-chan.vercel.app',
    accent: '#7f52ff',
  },
  {
    id: 'csharp',
    name: 'C#-chan',
    tagline: 'Elegant, structured, semicolon-loyal',
    url: 'https://sharp-chan.vercel.app',
    accent: '#9b4f96',
  },
  {
    id: 'python',
    name: 'Python-chan',
    tagline: 'Friendly, readable, a little bit magical',
    url: 'https://python-chan.vercel.app',
    accent: '#ffd43b',
  },
];

export default SIBLING_SITES;
