# ViviHead — Tracker de dor de cabeça

App web (PWA) pra Vivi registrar dias com dor de cabeça e exportar relatório
pra médica.

- **Firebase project**: `vivihead-2ea23`
- **Repo**: <https://github.com/vinigm/vivihead>
- **Site**: <https://vinigm.github.io/vivihead/> (após habilitar GitHub Pages)
- **Stack**: HTML + CSS + JS puro, Firestore, GitHub Pages, PWA

---

## Setup inicial (uma vez)

### 1. Pegar as chaves do Firebase

1. Abrir <https://console.firebase.google.com/u/0/project/vivihead-2ea23/settings/general>
2. Em "Seus apps", clicar no app Web (ou criar um novo se ainda não tiver)
3. Em "Configuração SDK", marcar "Config" e copiar os valores
4. Colar em [`js/firebase-config.js`](js/firebase-config.js) substituindo os `REPLACE_ME`

### 2. Habilitar Authentication (Google)

1. <https://console.firebase.google.com/u/0/project/vivihead-2ea23/authentication/providers>
2. Em "Sign-in method", habilitar **Google**
3. Em "Settings → Authorized domains", adicionar `vinigm.github.io`

### 3. Aplicar as regras do Firestore

1. <https://console.firebase.google.com/u/0/project/vivihead-2ea23/firestore/rules>
2. Colar o conteúdo de [`firestore.rules`](firestore.rules) e publicar

### 4. Push pro GitHub

```bash
cd /caminho/para/ViviHead
git init
git remote add origin https://github.com/vinigm/vivihead.git
git add .
git commit -m "init: tracker de dor de cabeça"
git branch -M main
git push -u origin main
```

### 5. Habilitar GitHub Pages

1. <https://github.com/vinigm/vivihead/settings/pages>
2. Source: **Deploy from a branch** · Branch: `main` · Folder: `/ (root)`
3. Aguardar ~1 min e abrir <https://vinigm.github.io/vivihead/>

### 6. Ícones do PWA

Os ícones em [`icons/`](icons/) ainda são placeholders. Substituir
`icon-192.png` (192×192) e `icon-512.png` (512×512) por algo bonitinho.

---

## Whitelist de acesso

Definida em [`js/auth.js`](js/auth.js) e nas regras do Firestore:

- `vinigm@gmail.com` → userId `vini`
- `victoria.cerutti@gmail.com` → userId `vivi`

Pra adicionar/trocar: editar `AUTHORIZED_EMAILS` e `EMAIL_TO_USER_ID` em
`js/auth.js` **e** o array de emails em `firestore.rules`, depois publicar
de novo.

---

## Instalar no iPhone (PWA)

1. Abrir o site no Safari
2. Botão de compartilhar → "Adicionar à Tela de Início"
3. Vira ícone fullscreen, igual app nativo

---

## Modelo de dados

Coleção `days/` no Firestore, um doc por dia por pessoa:

```js
days/{userId}_{YYYY-MM-DD} = {
  userId: "vivi" | "vini",
  date: "2026-05-23",
  hadHeadache: true | false,
  startedAt: ["acordar", "manha", "tarde", "noite"], // subset
  passedAt: ["fim_manha", "tarde", "noite", "dia_todo"], // subset
  notes: "string opcional",
  updatedAt: serverTimestamp()
}
```

---

## Fazer mudanças

1. Editar arquivos localmente
2. `git add . && git commit -m "..." && git push`
3. GitHub Pages atualiza em ~1 min
4. No celular: fechar e abrir o app de novo (network-first SW)

Ver [PROCESSO.md](PROCESSO.md) pra histórico de decisões.
