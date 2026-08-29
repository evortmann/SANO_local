import React, { useState } from "react";
import { AlertCircle, Eye, EyeOff, LockKeyhole, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login({ initialError = "" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(initialError);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Informe o usuário e a senha para continuar.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Acesso de demonstração exclusivamente local. Não publicar estas credenciais.
      if (email.trim().toLowerCase() !== "admin" || password.trim() !== "admin123") {
        setError("Usuário ou senha inválidos.");
        return;
      }

      window.localStorage.setItem("sano_demo_auth", "true");
      window.location.assign("/");
    } catch (loginError) {
      console.error("Erro ao iniciar sessão local:", loginError);
      setError("Não foi possível iniciar sessão. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#eff8f7] via-white to-[#dff3ef] p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:grid-cols-2">
        <section className="hidden bg-gradient-to-br from-[#0f766e] via-[#0d9488] to-[#1f6f68] p-10 text-white md:flex md:flex-col md:justify-between">
          <div>
            <img
              src="/sano-teamwork-logo.png"
              alt="SANO+"
              className="mb-8 h-20 w-20 rounded-2xl bg-white object-contain p-1 shadow-lg"
            />
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#d8f1ee]">
              SANO+
            </p>
            <h1 className="max-w-sm text-4xl font-bold leading-tight">
              Orientações nutricionais com mais segurança.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[#d8f1ee]">
              Acompanhe pacientes, consulte interações e guarde orientações nutricionais oncológicas num único espaço.
            </p>
          </div>
          <p className="text-sm text-[#bce6e1]">Acesso protegido para profissionais autorizados.</p>
        </section>

        <section className="p-7 sm:p-10 md:p-12">
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <img
              src="/sano-teamwork-logo.png"
              alt="SANO+"
              className="h-12 w-12 rounded-xl bg-white object-contain p-0.5 shadow"
            />
            <div>
              <p className="font-bold text-slate-900">SANO+</p>
              <p className="text-xs text-slate-500">Orientações Nutricionais</p>
            </div>
          </div>

          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d8f1ee] text-[#0f766e]">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Iniciar sessão</h2>
            
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-medium text-slate-700">
                  Usuário
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="login-email"
                    type="text"
                    autoComplete="username"
                    placeholder="Informe seu usuário"
                    value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 pl-10"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="text-sm font-medium text-slate-700">
                Senha
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Informe sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 px-10"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                  aria-label={showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="h-12 w-full bg-[#0da99a] text-base hover:bg-[#087f76]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  A entrar...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>

        </section>
      </div>
    </main>
  );
}
