"use client";

import { useState } from "react";
import { Key, Shield, UserCheck, Copy, Check, ArrowRight, Mail, Clock } from "lucide-react";

export function LegacyKeyManager() {
  const [executorName, setExecutorName] = useState("");
  const [executorEmail, setExecutorEmail] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activationSimulated, setActivationSimulated] = useState(false);
  const [inputKey, setInputKey] = useState("");
  const [activationResult, setActivationResult] = useState<"success" | "error" | null>(null);

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!executorName || !executorEmail) return;
    
    // Generate a secure looking random Legacy Key
    const uuid = crypto.randomUUID().split("-")[0].toUpperCase();
    const key = `SOUL-KEY-${uuid}-${executorName.substring(0, 3).toUpperCase()}`;
    setGeneratedKey(key);
  };

  const handleCopy = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateActivation = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey === generatedKey) {
      setActivationResult("success");
      setActivationSimulated(true);
    } else {
      setActivationResult("error");
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Panel 1: Key Generation */}
      <div className="brand-card rounded-[2.5rem] p-8 md:p-10">
        <div className="flex h-12 w-14 items-center justify-center rounded-2xl bg-seafoam/10 text-seafoam">
          <Shield className="h-6 w-6" />
        </div>
        <h3 className="mt-6 text-2xl font-black text-navy">Designate a Legacy Executor</h3>
        <p className="mt-2 text-sm leading-6 text-navy/65">
          Assign a trusted family member or legal executor. They will receive a private Legacy Key that can securely request access to your private archives when the time comes.
        </p>

        {generatedKey ? (
          <div className="mt-8 rounded-3xl bg-cream/50 border border-navy/5 p-6">
            <p className="text-xs font-black uppercase tracking-widest text-seafoam">Your Legacy Key is Ready</p>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-white border border-navy/10 p-4">
              <span className="font-mono font-black text-navy text-sm md:text-base tracking-wider select-all">
                {generatedKey}
              </span>
              <button
                onClick={handleCopy}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-white hover:bg-navy/90 active:scale-95 transition-all"
                aria-label="Copy key"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            
            <div className="mt-6 flex gap-3 text-xs leading-5 text-navy/60">
              <Mail className="h-4 w-4 text-sunset shrink-0 mt-0.5" />
              <span>
                An instruction card has been prepared for <span className="font-bold text-navy">{executorEmail}</span> explaining how to securely store this key.
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleGenerateKey} className="mt-8 grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-navy/60" htmlFor="executorName">
                Executor's Full Name
              </label>
              <input
                id="executorName"
                className="rounded-2xl border border-navy/10 bg-white px-4 py-3.5 text-sm focus:border-navy focus:outline-none"
                type="text"
                placeholder="e.g. Sarah Jenkins"
                value={executorName}
                onChange={(e) => setExecutorName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-navy/60" htmlFor="executorEmail">
                Executor's Email Address
              </label>
              <input
                id="executorEmail"
                className="rounded-2xl border border-navy/10 bg-white px-4 py-3.5 text-sm focus:border-navy focus:outline-none"
                type="email"
                placeholder="e.g. sarah@family.com"
                value={executorEmail}
                onChange={(e) => setExecutorEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="mt-4 flex items-center justify-center gap-2 rounded-full bg-navy py-4 font-black text-white hover:bg-navy/90 transition-all shadow-glow"
            >
              Generate Legacy Key <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>

      {/* Panel 2: Simulation / Key Activation */}
      <div className="brand-card rounded-[2.5rem] p-8 md:p-10 border-dashed">
        <div className="flex h-12 w-14 items-center justify-center rounded-2xl bg-sunset/10 text-sunset">
          <Key className="h-6 w-6" />
        </div>
        <h3 className="mt-6 text-2xl font-black text-navy">Simulate Key Activation</h3>
        <p className="mt-2 text-sm leading-6 text-navy/65">
          Test how your designated executor will securely claim the digital estate. Enter the generated Legacy Key below to trigger the verification simulation.
        </p>

        {activationSimulated ? (
          <div className="mt-8 rounded-3xl bg-seafoam/10 p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-seafoam/20 text-seafoam">
              <UserCheck className="h-6 w-6" />
            </div>
            <h4 className="mt-4 text-xl font-black text-navy">Identity Verified</h4>
            <p className="mt-2 text-sm leading-6 text-navy/70">
              The Legacy Key matches. The verification period has been initiated, and security notifications have been sent to your primary family contacts.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-navy border border-navy/5">
              <Clock className="h-3.5 w-3.5 text-sunset" /> 48-Hour Safety Hold Active
            </div>
          </div>
        ) : (
          <form onSubmit={handleSimulateActivation} className="mt-8 grid gap-4">
            <div className="grid gap-2">
              <label className="text-xs font-black uppercase tracking-wider text-navy/60" htmlFor="activationKey">
                Enter Legacy Key
              </label>
              <input
                id="activationKey"
                className="rounded-2xl border border-navy/10 bg-white px-4 py-3.5 font-mono text-sm focus:border-navy focus:outline-none"
                type="text"
                placeholder="SOUL-KEY-XXXX-XXX"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                required
              />
            </div>

            {activationResult === "error" && (
              <div className="rounded-2xl bg-sunset/10 p-4 text-xs font-bold text-sunset">
                Invalid Legacy Key. Please make sure to generate a key on the left first and paste it exactly.
              </div>
            )}

            <button
              type="submit"
              className="mt-4 flex items-center justify-center gap-2 rounded-full border border-navy/15 py-4 font-black text-navy hover:bg-cream/50 transition-all"
            >
              Verify & Claim Estate
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
