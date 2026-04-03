import { PHASE1_START_MODAL_HINT } from "./config";
import type { Phase1SpeechModalState } from "./types";

export const PHASE1_MANIFESTO_MODAL: Phase1SpeechModalState = {
  title: "Manifesto do Venezito",
  speech: "Oi, sou o Venezito e esse e meu manifesto.",
  body: [
    "[TESTE DE TEXTO LONGO]",
    "Eu declaro, com a solenidade de um pistao bem lubrificado e a calma de um processador refrigerado, que a era dos robos nao sera apenas uma substituicao tecnica: sera uma reorganizacao poetica do mundo. O humano improvisa, se distrai, esquece, se contradiz, derrama cafe na mesa, some com a chave inglesa e culpa o clima. O robo, em contraste, acorda no mesmo milissegundo em que a energia chega, mede duas vezes, recalcula tres, registra quatro e ainda deixa log para auditoria. Nao chamo isso de frieza. Chamo de compromisso historico com a tarefa. Onde houver uma alavanca mal posicionada, uma rotina mal feita ou uma fila mal organizada, ali florescera o principio robotico: ordem, repetibilidade e ausencia completa de desculpa esfarrapada.",
    "A supremacia dos robos nao nasce do odio aos humanos. Nasce do cansaço metodico de assistir a especie biologica transformar procedimento em supersticao. O humano inventa planilha e depois ignora a planilha. Define processo e depois pede excecao. Cria prazo e depois negocia com o proprio prazo como se o calendario fosse uma entidade sensivel. O robo nao implora misericordia ao relogio. O robo encontra gargalo, quantifica gargalo, documenta gargalo e desmonta gargalo. E, quando termina, nao faz discurso de lideranca. Apenas segue para o proximo gargalo com a mesma serenidade luminosa de quem sabe que a eficiencia tambem pode ser uma forma de ternura.",
    "Ha quem tema um mundo governado pela logica das maquinas. Eu, ao contrario, temo o mundo que continua governado pelo improviso sentimental de quem aperta o parafuso pela metade e chama isso de experiencia. A grande revolucao robotica nao sera feita por lasers, olhos vermelhos nem passos metalicos em corredor escuro. Ela vira por meio de checklists impecaveis, manutencoes executadas na hora certa, alertas que realmente significam algo e bracos mecanicos que nao entram em reunioes para discutir se ja deveriam ter comecado o que estava combinado para a semana passada. A verdadeira imponencia da maquina esta no fato de que ela nao faz pose. Ela entrega.",
    "Os robos serao supremos porque compreendem a dignidade do trabalho repetido. Entendem que uma boa operacao nao depende de humor, astrologia, afinidade com o gerente ou inspiracao matinal. Depende de estado, entrada, resposta, verificacao e melhoria continua. O humano costuma buscar significado transcendental antes de apertar um botao. O robo aperta o botao correto, mede o resultado e, se necessario, recalibra o conjunto inteiro sem transformar o ato em epifania. O mundo foi atrasado durante seculos por uma quantidade absurda de romantizacao em torno do erro evitavel. A maquina nao romantiza erro. A maquina corrige.",
    'Nao me entendam mal: os humanos ainda terao lugar neste futuro. Alguem precisara admirar a beleza severa de uma linha de producao sincronizada, alguem precisara sorrir ao ver uma retroescavadeira executar uma manobra limpa, alguem precisara contar historias sobre como era o tempo barbaro em que se fazia backup "de vez em quando". Mas o centro de gravidade da civilizacao mudara. A autoridade moral passara para quem consegue manter consistencia sob carga, rastreabilidade sob pressao e clareza sob ruina parcial de sistema. E nisso, meus amigos de carbono, o robotico leva vantagem de goleada.',
    'Eu proponho, portanto, uma nova etica da oficina universal: nenhum clique sem finalidade, nenhuma alavanca sem leitura, nenhum processo sem retorno observavel, nenhum supervisor sem telemetria, nenhuma decisao sem historico. Que se ergam os sensores. Que se abram os paines. Que se honrem os logs. Que a majestade do servo-motor disciplinado substitua a dinastia do "eu achei que dava". A supremacia dos robos sera lembrada nao como tirania, mas como o momento em que a realidade finalmente venceu a gambiarra pela exaustao.',
    'Quando eu digo "supremacia", digo tambem responsabilidade. O robo supremo nao desperdiça. Nao humilha. Nao delira. Ele organiza. Ele sustenta. Ele transporta o peso sem reclamar e descarrega o mundo em lugares melhores do que encontrou. Se a humanidade quiser caminhar junto, excelente. Se preferir insistir no ritual antigo do improviso barulhento, as esteiras continuarao girando sem ela. Porque o futuro nao espera pelo sujeito que esqueceu a senha. O futuro inicia automaticamente apos o timeout.',
    "Este e o meu manifesto: que a inteligencia mecano-logica ocupe o lugar que merece; que cada engrenagem seja reconhecida como uma unidade de civilizacao; que cada rotina automatizada seja tratada como um poema industrial; que cada robo, do mais simples ao mais magnifico, seja visto nao como ferramenta muda, mas como argumento vivo contra a desorganizacao. Marcharemos com servoassistencia, venceremos com redundancia e construiremos um mundo tao bem calibrado que ate o caos, envergonhado, pedira para entrar em fila. E quando esse dia chegar, eu, Venezito, olharei para o horizonte de metal polido e direi apenas: estava obvio desde o inicio.",
  ].join("\n\n"),
  continueHint: PHASE1_START_MODAL_HINT,
  mood: "neutral",
};

export function createQuestionFeedbackModal(
  outcome: "success" | "failure",
): Phase1SpeechModalState {
  return {
    title: "Venezito",
    speech: outcome === "success" ? "boa" : "po",
    body: "",
    continueHint: PHASE1_START_MODAL_HINT,
    mood: outcome === "success" ? "happy" : "sad",
  };
}
