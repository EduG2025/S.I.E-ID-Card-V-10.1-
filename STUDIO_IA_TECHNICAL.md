
# STUDIO IA - Documentação Técnica (S.I.E)

## 1. Visão Geral da Arquitetura

O módulo **Studio IA** é composto por dois sub-sistemas principais integrados ao S.I.E:
1.  **Design Studio (Carteirinhas):** Um editor vetorial baseado em DOM (HTML/CSS) que permite posicionamento absoluto de elementos para impressão.
2.  **Secretária Ativa (Documentos):** Um gerador de texto baseado em LLM (Gemini 1.5 Pro/Flash) integrado a um editor Rich Text (WYSIWYG).

### Fluxo de Dados
```mermaid
graph TD
    A[Frontend: Settings.tsx] -->|Edição de Template| B[Estado React Local]
    B -->|Save| C[API: POST /templates]
    C -->|Persistência| D[MySQL: table id_card_templates (JSON)]
    
    E[Frontend: UserManagement.tsx] -->|Renderização| F[Componente: CardFaceRenderer]
    D -->|Load Template| E
    G[Dados do Usuário] -->|Merge Dinâmico| F
    F -->|Exportação| H[html2canvas / jsPDF]
```

## 2. Design Studio (Carteirinhas)

### Modelo de Dados (`IdCardTemplate`)
O template não armazena os dados do usuário, apenas a **estrutura** e as **referências** aos campos.

```typescript
interface IdCardTemplate {
  width: number; // Largura base em px (ex: 600px para alta resolução)
  height: number;
  elements: CardElement[]; // Array de camadas
}

interface CardElement {
  type: 'text-dynamic' | 'text-static' | 'image' | 'shape' | 'qrcode';
  field?: string; // Chave do objeto User (ex: 'name', 'cpf')
  x: number; // Posição X em Porcentagem (%) relativa ao container pai
  y: number; // Posição Y em Porcentagem (%) relativa ao container pai
  style: CSSProperties; // Estilos visuais (cor, fonte, z-index)
}
```

### Motor de Renderização (`CardFaceRenderer`)
O componente `CardFaceRenderer` é "burro". Ele recebe um `template` e um objeto `user`.
1.  Ele itera sobre `template.elements`.
2.  Se o elemento for `text-dynamic`, ele busca `user[element.field]`.
3.  Ele aplica estilos CSS absolutos: `left: ${element.x}%`, `top: ${element.y}%`.
    *   **Por que porcentagem?** Para permitir que o cartão seja renderizado em qualquer tamanho (preview na sidebar, modal grande, impressão em PDF) sem perder o layout relativo.

### Exportação (PDF/JPG)
Usamos `html2canvas` para "tirar uma foto" do DOM renderizado.
*   **Truque de Alta Resolução:** Para evitar borrões no PDF, renderizamos o cartão em um container invisível (`position: fixed; left: -9999px`) com escala 2x ou 3x o tamanho original antes de capturar.

## 3. Secretária Ativa (Documentos Inteligentes)

### Engenharia de Prompt (Backend)
O backend (`server.cjs`) atua como proxy para a API Gemini. O prompt do sistema é crucial:

**System Instruction:**
> "Você é uma secretária administrativa experiente. Sua saída deve ser EXCLUSIVAMENTE código HTML válido para ser inserido dentro de uma `div contenteditable`. Não use Markdown. Use tags `<b>`, `<br>`, `<ul>`. Mantenha tom formal."

### Few-Shot Learning (Referência)
Quando o usuário faz upload de um arquivo de referência:
1.  O Frontend lê o arquivo (se texto/PDF simples) ou o Backend faz OCR.
2.  O conteúdo extraído é injetado no contexto da IA como: *"Baseie-se neste estilo: [CONTEÚDO DO ARQUIVO]..."*.
3.  Isso permite que a IA imite o cabeçalho, rodapé e jargões da associação específica.

## 4. Banco de Dados (MySQL)

Utilizamos colunas do tipo `JSON` para flexibilidade. Isso evita criar tabelas separadas para `elements` (posições X/Y) que mudam com frequência.

**Tabela `id_card_templates`:**
*   `elements_json`: Armazena o array de objetos `CardElement`.

**Tabela `users`:**
*   `social_data_json`: Armazena o questionário socioeconômico completo (estrutura variável).

## 5. Setup de Desenvolvimento

1.  **Frontend:** `npm run dev` (Vite)
2.  **Backend:** `node server.cjs` (Express)
3.  **Env:** Configure `API_KEY` (Google Gemini) e credenciais do MySQL no `.env`.
