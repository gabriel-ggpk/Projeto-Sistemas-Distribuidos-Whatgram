const botao_criar = document.getElementById("criar_button");
const botao_enviar = document.getElementById("enviar_button");

const websocket = new WebSocket("ws://localhost:8765/");

function iniciar() {
    botao_criar.addEventListener("click", ({ target }) => {
        const event = {
            servico: "criar_grupo",
            criador 0,
            nome: "nome_teste",
            membros: [1, 2, 7, 8, 3],
        };
        websocket.send(JSON.stringify(event));
    });
    
    botao_enviar.addEventListener("click", ({ target }) => {
        const event = {
            servico: "enviar_mensagem",
            remetente: 0,
            grupo: 0,
            mensagem: "Mensagem de teste.",
        };
        websocket.send(JSON.stringify(event));
    });
}

iniciar();