# ViviHead — Processo de criação

> Tracker de dor de cabeça pra Vivi acompanhar o tratamento e exportar um
> relatório pra médica. Construído na mesma arquitetura do
> [GymProject](../GymProject/PROCESSO.md): HTML+CSS+JS puro, Firebase
> Firestore, GitHub Pages e PWA.

---

## 1. v1 — MVP

Decisões iniciais:

| Decisão                                | Por quê                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------- |
| Mesma stack do GymProject              | Já validada, zero build, deploy trivial                                   |
| Tema próprio (coral pastel, light)     | App de saúde — visual mais leve combina com o uso clínico                 |
| Multi-select em "início" e "passou"    | A dor de cabeça vai e volta no mesmo dia, não cabe em um único valor      |
| Auth com whitelist Vini + Vivi         | Vini precisa conseguir testar/manter; Vivi é quem usa de verdade          |
| Export em página HTML imprimível       | `window.print()` → "Salvar como PDF" do Safari/Chrome é suficiente, zero biblioteca extra |

### Estrutura inicial

- `index.html` — página única (Hoje + Estatísticas + Calendário + Exportar)
- `css/style.css` — tema light/coral
- `js/firebase-config.js` — chaves (placeholder)
- `js/auth.js` — gate + whitelist
- `js/storage.js` — wrappers Firestore com fallback localStorage
- `js/utils.js` — helpers de data, range, labels de períodos
- `js/tracker.js` — formulário de registro do dia
- `js/calendar.js` — calendário mensal com cores (dor / sem dor / sem registro)
- `js/stats.js` — KPIs por período
- `js/export.js` — gera relatório HTML imprimível em popup
- `js/app.js` — bootstrap principal
- `manifest.webmanifest` + `sw.js` — PWA instalável
- `firestore.rules` — auth + whitelist + formato do docId

### Modelo de dados

```js
days/{userId}_{YYYY-MM-DD} = {
  userId,
  date,
  hadHeadache: true | false,
  startedAt: ["acordar" | "manha" | "tarde" | "noite", ...],
  passedAt: ["fim_manha" | "tarde" | "noite" | "dia_todo", ...],
  notes,
  updatedAt
}
```

userId é `"vivi"` ou `"vini"` (lower, sem acento — facilita as rules).

---

## 2. Próximos passos planejados

- **Notificações** — lembrete diário (provavelmente FCM ou só Notification API local)
- **Registro de remédios** — quais tomou, em que horário, dosagem
- **Intensidade** — escala 1-10 ou leve/moderada/forte
- **Gatilhos** — checklist (estresse, sono ruim, menstruação, alimentação...)
- **Comparação com remédios** — correlação visual entre tomar remédio X e dia sem dor

---

*Construído por Vini com a ajuda do Claude, a partir de 23 de maio de 2026.*
