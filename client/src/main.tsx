
import { createRoot } from "react-dom/client";
// import App from "./App";
import "./index.css";

// Teste básico sem imports complexos
function TestApp() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'red' }}>TESTE - React funcionando!</h1>
      <p>Se você vê esta mensagem, o React está carregando corretamente.</p>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<TestApp />);
