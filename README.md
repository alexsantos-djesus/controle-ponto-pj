# Controle de Ponto

Sistema de **controle de ponto** desenvolvido com **Next.js**, **Prisma** e **PostgreSQL**, permitindo registrar entradas e saídas, visualizar horas trabalhadas e gerar relatórios profissionais em **Excel** e **Word**.

---

## ✨ Funcionalidades

- Registro de **entrada** e **saída**
- Cálculo automático de **horas trabalhadas**
- Relógio em tempo real (Horário de Brasília)
- Relatórios mensais:
  - 📊 **Excel**
  - 📝 **Word**
- Filtro por **mês, ano e dia**
- Total de horas exibido em **horas + minutos**
- Interface moderna (Dark Mode)

---

## 🛠️ Tecnologias

- **Next.js 14 (App Router)**
- **TypeScript**
- **Prisma ORM**
- **PostgreSQL (NeonDB)**
- **Tailwind CSS**
- **ExcelJS**
- **docx**
- **Vercel (Deploy)**

---

## ⚙️ Configuração do Ambiente

### 1. Instale as dependências
```bash
npm install
```

### 2. Configure as variáveis de ambiente
Crie um arquivo `.env`:
```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

> ⚠️ Prisma 7.x — seguir **estritamente** a documentação oficial.

### 3. Rodar migrations
```bash
npx prisma migrate deploy
```

### 4. Iniciar o projeto
```bash
npm run dev
```

---

## 📁 Estrutura Principal

```
src/
 ├─ app/
 │   ├─ dashboard/
 │   ├─ reports/
 │   └─ api/
 ├─ lib/
 │   ├─ prisma.ts
 │   ├─ auth.ts
 │   └─ time-calculator.ts
 └─ styles/
```

---

## 📊 Relatórios

- Nome dos arquivos:
  - **Relatório de Janeiro de 2026.xlsx**
  - **Relatório de Janeiro de 2026.docx**
- Totais exibidos em **HH:mm** (ex: 01h 56m)

---

## 🚀 Deploy

- **Frontend:** Vercel
- **Database:** NeonDB

Após configurar as variáveis no painel da Vercel, basta clicar em **Deploy**.

---

## ✅ Status do Projeto

✔ Regras de negócio revisadas  
✔ UI refinada  
✔ Fluxo completo testado  
✔ Pronto para produção  

---

## 👨‍💻 Autor

Projeto desenvolvido para fins profissionais e estudo avançado de stack moderna.
