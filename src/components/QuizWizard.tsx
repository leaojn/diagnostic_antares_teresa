import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Users, DollarSign, ShoppingCart, Target, CheckCircle, MessageCircle } from "lucide-react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import QuizProgress from "./QuizProgress";
import QuizField from "./QuizField";
import QuizInput from "./QuizInput";
import QuizSelect from "./QuizSelect";

interface FormData {
  empresa: string;
  nome: string;
  cargo: string;
  segmento: string;
  cidadeEstado: string;
  whatsapp: string;
  colaboradores: string;
  setorCompras: string;
  sabeGasto: string;
  fornecedores: string;
  controleConsumo: string;
  comoCompra: string;
  emergencias: string;
  interesses: string;
  desafio: string;
  diagnostico: string;
}

const initial: FormData = {
  empresa: "", nome: "", cargo: "", segmento: "", cidadeEstado: "", whatsapp: "",
  colaboradores: "", setorCompras: "", sabeGasto: "", fornecedores: "",
  controleConsumo: "", comoCompra: "", emergencias: "", interesses: "", desafio: "", diagnostico: "",
};

const stepIcons = [Building2, Users, DollarSign, ShoppingCart, Target];

function calcScore(d: FormData): number {
  let s = 0;
  if (d.fornecedores === "mais5") s += 2;
  if (d.controleConsumo === "nao") s += 2;
  if (d.emergencias === "frequente") s += 2;
  if (d.sabeGasto === "nao") s += 1;
  if (d.comoCompra === "informal") s += 1;
  if (d.setorCompras === "nao") s += 1;
  return s;
}

function getGrade(score: number) {
  if (score <= 2) return { level: 1, title: "Sua operação está no caminho certo!", desc: "Você já possui um bom nível de organização nas compras. Pequenos ajustes podem otimizar ainda mais seus resultados." };
  if (score <= 5) return { level: 2, title: "Há oportunidades importantes de melhoria!", desc: "Identificamos pontos que podem gerar economia e eficiência significativas na sua operação de compras." };
  return { level: 3, title: "Sua operação precisa de atenção urgente!", desc: "Existem riscos operacionais e financeiros que precisam ser endereçados. Um diagnóstico completo pode transformar seus resultados." };
}

function buildRespostaRow(data: FormData, score: number) {
  const grade = getGrade(score);
  return {
    empresa: data.empresa,
    nome: data.nome,
    cargo: data.cargo,
    segmento: data.segmento,
    cidade_estado: data.cidadeEstado,
    whatsapp: data.whatsapp,
    colaboradores: data.colaboradores,
    setor_compras: data.setorCompras,
    sabe_gasto: data.sabeGasto,
    fornecedores: data.fornecedores,
    controle_consumo: data.controleConsumo,
    como_compra: data.comoCompra,
    emergencias: data.emergencias,
    interesses: data.interesses,
    desafio: data.desafio,
    diagnostico: data.diagnostico,
    score,
    payload: {
      grade: { level: grade.level, title: grade.title, desc: grade.desc },
      answers: data,
    },
  };
}

const variants = {
  enter: { opacity: 0, x: 40 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
};

const QuizWizard = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const set = (key: keyof FormData, val: string) => {
    setData((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (step === 0) {
      if (!data.empresa.trim()) e.empresa = "Obrigatório";
      if (!data.nome.trim()) e.nome = "Obrigatório";
      if (!data.whatsapp.trim()) e.whatsapp = "Obrigatório";
    }
    if (step === 1 && !data.colaboradores) e.colaboradores = "Obrigatório";
    if (step === 2 && !data.sabeGasto) e.sabeGasto = "Obrigatório";
    if (step === 3 && !data.comoCompra) e.comoCompra = "Obrigatório";
    if (step === 4 && !data.diagnostico) e.diagnostico = "Obrigatório";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = async () => {
    if (!validate()) return;
    if (step === 4) {
      if (!isSupabaseConfigured()) {
        setSubmitError("Configuração do Supabase ausente. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env.");
        return;
      }
      setSaving(true);
      setSubmitError(null);
      const score = calcScore(data);
      const { error } = await supabase.from("respostas_quiz").insert(buildRespostaRow(data, score));
      setSaving(false);
      if (error) {
        setSubmitError(error.message);
        return;
      }
      setDone(true);
      return;
    }
    setStep((s) => s + 1);
  };

  const prev = () => setStep((s) => Math.max(0, s - 1));

  if (done) {
    const score = calcScore(data);
    const grade = getGrade(score);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-card rounded-2xl p-8 border border-border text-center space-y-6"
        >
          <CheckCircle className="mx-auto text-primary" size={56} />
          <h2 className="text-2xl font-bold text-foreground">{grade.title}</h2>
          <p className="text-muted-foreground">{grade.desc}</p>
          <div className="inline-block bg-secondary px-4 py-2 rounded-lg">
            <span className="text-sm text-muted-foreground">Grau de atenção: </span>
            <span className="text-primary font-bold">{grade.level}/3</span>
          </div>
          {data.diagnostico === "sim" && (
            <p className="text-sm text-primary font-medium">
              Em breve, nossa equipe enviará seu diagnóstico personalizado.
            </p>
          )}
          <div className="flex flex-col gap-3 pt-4 w-full">
            <a
              href="https://antaresdistribuidora.agileecommerce.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-lg bg-card border-2 border-primary text-foreground font-semibold hover:bg-primary/10 transition-colors"
            >
              <ShoppingCart size={18} /> Acessar E-commerce Antares
            </a>
            <a
              href="https://wa.me/558699934439?text=Ol%C3%A1,%20quero%20saber%20mais!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageCircle size={18} /> Falar no WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  const Icon = stepIcons[step];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Quiz Diagnóstico Estratégico</h1>
          <p className="text-sm text-muted-foreground mt-1">Descubra como otimizar as compras da sua empresa</p>
        </div>

        <QuizProgress currentStep={step} totalSteps={5} />

        <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="text-primary" size={22} />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              {["Perfil da Empresa", "Tamanho da Operação", "Gastos e Fornecedores", "Processo de Compras", "Desafios e Próximos Passos"][step]}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {step === 0 && (
                <>
                  <QuizField label="Nome da empresa" required error={errors.empresa}>
                    <QuizInput value={data.empresa} onChange={(e) => set("empresa", e.target.value)} placeholder="Ex: Distribuidora ABC" hasError={!!errors.empresa} />
                  </QuizField>
                  <QuizField label="Seu nome" required error={errors.nome}>
                    <QuizInput value={data.nome} onChange={(e) => set("nome", e.target.value)} placeholder="Seu nome completo" hasError={!!errors.nome} />
                  </QuizField>
                  <QuizField label="Cargo">
                    <QuizSelect
                      value={data.cargo}
                      onChange={(e) => set("cargo", e.target.value)}
                      placeholder="Selecione..."
                      options={[
                        { value: "gestor_financeiro", label: "Gestor financeiro" },
                        { value: "administrativo", label: "Administrativo" },
                        { value: "empresario", label: "Empresário" },
                        { value: "gerente_compras", label: "Gerente de compras" },
                        { value: "diretor", label: "Diretor" },
                        { value: "coordenador", label: "Coordenador" },
                        { value: "outro", label: "Outro" },
                      ]}
                    />
                  </QuizField>
                  <QuizField label="Segmento">
                    <QuizInput value={data.segmento} onChange={(e) => set("segmento", e.target.value)} placeholder="Ex: Alimentício" />
                  </QuizField>
                  <QuizField label="Cidade/Estado">
                    <QuizInput value={data.cidadeEstado} onChange={(e) => set("cidadeEstado", e.target.value)} placeholder="Ex: Teresina/PI" />
                  </QuizField>
                  <QuizField label="WhatsApp/Telefone" required error={errors.whatsapp}>
                    <QuizInput value={data.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="(00) 00000-0000" hasError={!!errors.whatsapp} />
                  </QuizField>
                </>
              )}

              {step === 1 && (
                <>
                  <QuizField label="Quantos colaboradores?" required error={errors.colaboradores}>
                    <QuizSelect
                      value={data.colaboradores}
                      onChange={(e) => set("colaboradores", e.target.value)}
                      placeholder="Selecione"
                      hasError={!!errors.colaboradores}
                      options={[
                        { value: "1-10", label: "1 a 10" },
                        { value: "11-50", label: "11 a 50" },
                        { value: "51-200", label: "51 a 200" },
                        { value: "200+", label: "Mais de 200" },
                      ]}
                    />
                  </QuizField>
                  <QuizField label="Possui setor de compras estruturado?">
                    <QuizSelect
                      value={data.setorCompras}
                      onChange={(e) => set("setorCompras", e.target.value)}
                      placeholder="Selecione"
                      options={[
                        { value: "sim", label: "Sim" },
                        { value: "nao", label: "Não" },
                        { value: "parcial", label: "Parcialmente" },
                      ]}
                    />
                  </QuizField>
                </>
              )}

              {step === 2 && (
                <>
                  <QuizField label="Sabe quanto gasta mensalmente com suprimentos?" required error={errors.sabeGasto}>
                    <QuizSelect
                      value={data.sabeGasto}
                      onChange={(e) => set("sabeGasto", e.target.value)}
                      placeholder="Selecione"
                      hasError={!!errors.sabeGasto}
                      options={[
                        { value: "sim", label: "Sim, tenho controle total" },
                        { value: "parcial", label: "Tenho uma estimativa" },
                        { value: "nao", label: "Não sei ao certo" },
                      ]}
                    />
                  </QuizField>
                  <QuizField label="Quantos fornecedores ativos?">
                    <QuizSelect
                      value={data.fornecedores}
                      onChange={(e) => set("fornecedores", e.target.value)}
                      placeholder="Selecione"
                      options={[
                        { value: "1-2", label: "1 a 2" },
                        { value: "3-5", label: "3 a 5" },
                        { value: "mais5", label: "Mais de 5" },
                      ]}
                    />
                  </QuizField>
                  <QuizField label="Possui controle de consumo por setor/departamento?">
                    <QuizSelect
                      value={data.controleConsumo}
                      onChange={(e) => set("controleConsumo", e.target.value)}
                      placeholder="Selecione"
                      options={[
                        { value: "sim", label: "Sim" },
                        { value: "nao", label: "Não" },
                        { value: "parcial", label: "Parcialmente" },
                      ]}
                    />
                  </QuizField>
                </>
              )}

              {step === 3 && (
                <>
                  <QuizField label="Como são feitas as compras?" required error={errors.comoCompra}>
                    <QuizSelect
                      value={data.comoCompra}
                      onChange={(e) => set("comoCompra", e.target.value)}
                      placeholder="Selecione"
                      hasError={!!errors.comoCompra}
                      options={[
                        { value: "formal", label: "Processo formal com cotação" },
                        { value: "misto", label: "Mix de formal e informal" },
                        { value: "informal", label: "Sem processo definido" },
                      ]}
                    />
                  </QuizField>
                  <QuizField label="Frequência de compras emergenciais?">
                    <QuizSelect
                      value={data.emergencias}
                      onChange={(e) => set("emergencias", e.target.value)}
                      placeholder="Selecione"
                      options={[
                        { value: "raro", label: "Raramente" },
                        { value: "eventual", label: "Eventualmente" },
                        { value: "frequente", label: "Frequentemente" },
                      ]}
                    />
                  </QuizField>
                </>
              )}

              {step === 4 && (
                <>
                  <QuizField label="O que mais interessa para sua empresa?">
                    <QuizSelect
                      value={data.interesses}
                      onChange={(e) => set("interesses", e.target.value)}
                      placeholder="Selecione"
                      options={[
                        { value: "economia", label: "Reduzir custos" },
                        { value: "agilidade", label: "Mais agilidade nas compras" },
                        { value: "controle", label: "Maior controle de estoque" },
                        { value: "fornecedor", label: "Centralizar fornecedores" },
                      ]}
                    />
                  </QuizField>
                  <QuizField label="Qual o maior desafio hoje?">
                    <QuizInput value={data.desafio} onChange={(e) => set("desafio", e.target.value)} placeholder="Descreva brevemente..." />
                  </QuizField>
                  <QuizField label="Gostaria de receber um diagnóstico personalizado?" required error={errors.diagnostico}>
                    <div className="flex gap-3">
                      {["sim", "nao"].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => set("diagnostico", v)}
                          className={`flex-1 py-2.5 rounded-lg font-medium border transition-colors ${
                            data.diagnostico === v
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-secondary text-muted-foreground border-border hover:border-primary/50"
                          }`}
                        >
                          {v === "sim" ? "Sim" : "Não"}
                        </button>
                      ))}
                    </div>
                  </QuizField>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {step === 4 && submitError && (
            <p className="text-sm text-destructive mt-4" role="alert">
              {submitError}
            </p>
          )}

          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <button
                type="button"
                onClick={prev}
                disabled={saving}
                className="px-5 py-2.5 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                Voltar
              </button>
            ) : <div />}
            <button
              type="button"
              onClick={() => void next()}
              disabled={saving}
              className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {step === 4 ? (saving ? "Salvando..." : "Finalizar") : "Próximo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizWizard;
