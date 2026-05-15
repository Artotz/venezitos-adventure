export const TEXT = {
  common: {
    phase1: "Fase 1",
    phase2: "Fase 2",
    editor: "Editor",
    venezito: "Venezito",
    play: "Tocar",
    pause: "Pausar",
    reset: "Resetar",
    remove: "Remover",
  },
  mainMenu: {
    phaseSelectorAria: "Selecionar fase",
    phase1Eyebrow: "Veneza Equipamentos",
    phase1Action: "Jogar fase 1",
  },
  pauseMenu: {
    eyebrow: "Pausado",
    title: "Menu de pausa",
    controls: "Controles",
    toggle: "Alternar",
    resume: "Retomar",
    mainMenu: "Menu principal",
  },
  modeTabs: {
    aria: "Modos da aplicação",
  },
  editor: {
    tabsAria: "Controles da retro",
    tabs: {
      poses: "Poses",
      animations: "Animações",
      grease: "Venezito",
      sounds: "Sons",
      points: "Pontos",
    },
    animations: {
      title: "Animações",
      preset: "Preset",
      timeline: "Timeline",
      keyframe: "Keyframe",
    },
    grease: {
      title: "Venezito Grease",
      frameDuration: "Duração por frame",
      framesPerPoint: "Frames por ponto",
      spriteHeight: "Altura do sprite",
      spriteOffsetX: "Offset X",
      spriteOffsetY: "Offset Y",
      spritePivotX: "Pivot X",
      spritePivotY: "Pivot Y",
      previewPrefix: "Preview usando",
      previewSuffix: "pontos da máquina.",
      adjustAndPlay: "Ajuste os parâmetros e toque a animação.",
      currentPoint: (current: number, total: number) =>
        `Ponto atual: ${current}/${total}.`,
      rotationFrame: (frame: number) => `Rotação frame ${frame}`,
      offsetYFrame: (frame: number) => `Offset Y frame ${frame}`,
      currentConfig: "Config atual",
    },
    points: {
      title: "Pontos",
      clear: "Limpar",
      help: "Clique no desenho da retro para salvar coordenadas relativas à máquina.",
      savedSingular: "ponto salvo",
      savedPlural: "pontos salvos",
      copyFormat: "Formato para copiar",
      empty: "Nenhum ponto salvo ainda.",
    },
    pose: {
      title: "Poses",
    },
    sounds: {
      title: "Sons",
      stopAll: "Parar todos",
      globalVolume: "Volume global",
      retro: "Retro",
      phase1: "Fase 1",
    },
    aria: {
      canvas:
        "Editor da retroescavadeira usando as mesmas poses e animações da fase 1",
    },
    loadingCanvas: "Carregando camadas retro...",
  },
  retro: {
    layers: {
      layer1: "Camada 1 em relação ao corpo",
      layer2: "Camada 2 em relação à camada 1",
      body: "Corpo fixo",
      frontWheel: "Pneu dianteiro",
      rearWheel: "Pneu traseiro",
      layer6: "Camada 6 em relação ao corpo",
      layer7: "Camada 7 em relação à camada 6",
      layer8: "Camada 8 em relação à camada 7",
    },
    sounds: {
      dirt: "Terra 1",
      dirt2: "Terra 2",
      unload: "Descarga",
    },
    animations: {
      bucketCycle1: "Ciclo de caçamba 1",
      bucketCycle2: "Ciclo de caçamba 2",
      armExtended: "Braço estendido",
      rearUnloading: "Descarregando traseira",
    },
  },
  phase1: {
    menuTitle: "Treinando com o Venezito",
    menuDescription:
      "Entre na retroescavadeira e aprenda tudo sobre a operação!",
    startModalTitle: "Controles da fase",
    startModalDefaultDescription:
      "Use A/D para alternar F, N e R.\nUse W/S para trocar marcha e as setas para operar.",
    startModalHint: "Pressione um botão de ação para continuar",
    initialMessage: (brakeLabel: string) =>
      `Use A/D no FNR, W/S para marcha e ${brakeLabel} para frear.`,
    controls: {
      keyboardName: "WASD + setas",
      playstationName: "Setas + PlayStation",
      xboxName: "Setas + Xbox",
      keyboardDriveSummary: "FNR em A/D, marchas em W/S",
      gamepadDriveSummary: "FNR e marchas no D-pad ou analógico",
      keyboardEventSummary: "Eventos nas setas",
      faceButtons: "Eventos nos face buttons",
      initialMessage: (
        fnrUp: string,
        fnrDown: string,
        gearUp: string,
        gearDown: string,
        brake: string,
      ) =>
        `Use ${fnrUp}/${fnrDown} no FNR, ${gearUp}/${gearDown} para marcha e ${brake} para frear.`,
      startDescription: (
        fnrUp: string,
        fnrDown: string,
        gearUp: string,
        gearDown: string,
        eventSummary: string,
      ) =>
        `Use ${fnrUp}/${fnrDown} para alternar F, N e R.\nUse ${gearUp}/${gearDown} para trocar marcha e ${eventSummary.toLowerCase()}.`,
      eventAction: {
        manual: (title: string, driveState: string, action: string) =>
          `${title}: use ${driveState} e pressione ${action}.`,
        traction: (title: string, driveState: string, action: string) =>
          `${title}: use ${driveState} e ${action} no trecho.`,
      },
      driveAdjustment: {
        stop: (title: string, driveState: string) =>
          `${title}: ajuste para ${driveState} e pare a máquina.`,
        gear: (title: string, driveState: string) =>
          `${title}: ajuste para ${driveState}.`,
      },
    },
    dialogue: {
      manifestoTitle: "introdução do jogo",
      manifestoSpeech: "Oi, eu sou o Venezito!",
      manifestoBody: [
        "Neste jogo, você vai dirigir a retroescavadeira para a esquerda usando o FNR e reagir aos eventos no momento certo.",
        "Ao longo do percurso, você vai usar os comandos da máquina para carregar, cavar, engraxar e frear quando precisar controlar a aproximação.",
        "Também vão aparecer perguntas rápidas de segurança e operação. Elas servem para reforçar o que cada situação exige durante a fase.",
        "Seu objetivo é manter a máquina em movimento, acertar os comandos dentro da área certa e acumular pontos enquanto aprende como cada parte da operação funciona.",
      ],
      feedbackSuccessTitle: "Resposta Certa!",
      feedbackFailureTitle: "Resposta errada!",
      feedbackSuccessSpeech: "Muito bem!",
      feedbackFailureSpeech: "Poxa...",
      feedbackSuccessBody: (explanation: string) =>
        `Essa é a resposta certa, pois ${explanation}`,
      feedbackFailureBody: (correctAnswer: string, explanation: string) =>
        `A resposta certa é "${correctAnswer}" porque ${explanation}`,
      shortFailureAnswer: (correctAnswer: string) =>
        `Resposta errada. A resposta certa é ${correctAnswer}.`,
      questionIntroTitle: "Pergunta do instrutor",
      questionIntroSpeech: "Hora da manutenção!",
      questionIntroBody:
        "Antes de seguir com a operação, vamos fazer uma parada rápida de conferência. Pense como um operador atento: observe a situação, revise o procedimento e responda usando as setas.",
    },
    events: {
      pickupLoad: {
        title: "Carregar carregadeira",
        description: "Punhado de terra no caminho",
        hint: "A carregadeira enche a frente sem mexer na traseira.",
        success: "Terra apanhada. A caçamba está carregada.",
        animation: "Ciclo de caçamba 1",
      },
      pickupUnload: {
        title: "Descarregar carregadeira",
        description: "Caminhão esperando à frente",
        hint: "Pare a máquina e descarregue a terra da frente.",
        success: "Terra descarregada no caminhão.",
        animation: "Ciclo de caçamba 2",
      },
      digLoad: {
        title: "Carregar retroescavadeira",
        description: "Ponto de escavação atrás",
        hint: "A retroescavadeira carrega a traseira e persiste no final.",
        success: "Retroescavadeira carregada atrás.",
        animation: "Braço estendido",
      },
      digUnload: {
        title: "Descarregar retroescavadeira",
        description: "Vala para descarregar atrás",
        hint: "A retro abre e descarrega atrás sem mexer na frente.",
        success: "Retroescavadeira descarregada na vala.",
        animation: "Descarregando traseira",
      },
      grease: {
        title: "Aplicar graxa",
        description: "Ponto de lubrificação no caminho",
        hint: "A máquina desacelera, para para a graxa e retoma depois.",
        success: "Graxa aplicada. Volte para a operação.",
        animation: "Aplicando graxa",
      },
      traction: {
        title: "Frear",
        description: "Ponto de controle no caminho",
        hint: (key: string) => `Use ${key} para frear a máquina.`,
        success: "Aproximação controlada com o freio.",
        failure: "Você atravessou o trecho sem frear.",
      },
      question: {
        title: "Parada de avaliação",
        description: "Instrutor bloqueando a pista",
        hint: (keys: string) =>
          `A máquina para e você responde seguindo ${keys} no modal.`,
        success: "Pergunta respondida.",
        modalTitle: "Pergunta do instrutor",
        selectionHint: (keys: string) => `Use ${keys} para responder`,
      },
    },
    questions: {
      safetyLock: {
        prompt:
          "Ao se aproximar de um ponto de operação, qual ação ajuda a controlar melhor a máquina?",
        up: "Subir marcha e manter velocidade",
        left: "Virar bruscamente para aliviar a frente",
        right: "Acelerar para passar mais rápido",
        down: "Frear e reduzir a aproximação",
        explanation:
          "frear antes do ponto de operação reduz a velocidade e facilita acertar o comando dentro da área correta.",
        success: "Resposta correta. O instrutor liberou a passagem.",
        failure: "Resposta errada. O instrutor travou a pontuação do evento.",
      },
      loaderHeight: {
        prompt:
          "Ao se deslocar com a caçamba frontal carregada, qual postura é mais segura?",
        up: "Manter a caçamba baixa e estável",
        left: "Levantar ao máximo para enxergar melhor",
        right: "Balançar a frente para distribuir o peso",
        down: "Andar de ré para aliviar o eixo dianteiro",
        explanation:
          "manter a caçamba baixa e estável melhora o equilíbrio da máquina e deixa o deslocamento mais seguro.",
        success: "Resposta correta. A operação continua.",
        failure: "Resposta errada. A avaliação do operador caiu.",
      },
      rearDig: {
        prompt:
          "Na retro traseira, qual atitude reduz risco ao descarregar material em uma vala?",
        up: "Girar o braço acima da cabine com velocidade máxima",
        left: "Confirmar estabilidade antes de descarregar",
        right: "Descarregar com a máquina ainda em movimento",
        down: "Abrir a vala sem observar a área ao redor",
        explanation:
          "confirmar a estabilidade antes de descarregar reduz o risco de deslocamento da máquina e de manobras inseguras na vala.",
        success: "Resposta correta. A área foi liberada.",
        failure: "Resposta errada. O fiscal marcou a manobra como falha.",
      },
    },
    render: {
      fnrTitle: "FNR",
      fnrDescription: (fnrUp: string, fnrDown: string) =>
        `O FNR escolhe o sentido da máquina: F para frente, N parado e R para ré. Use ${fnrUp}/${fnrDown} para mover a alavanca entre as posições.`,
      fnrForward: "Frente",
      fnrNeutral: "Parado",
      fnrReverse: "Ré",
      hudScore: "pontuação",
      hudHourmeter: "Horímetro",
      finalBubbleNew: "Novo highscore!",
      finalBubbleComplete: "Treinamento concluído!",
      finalTitle: "FIM DO TREINAMENTO",
      finalNewHighscore: "Novo highscore",
      finalHighscore: "Highscore",
      finalBody:
        "O treinamento chegou ao fim. Venezito registrou sua pontuação.",
      finalScore: "pontuação",
      finalHourmeter: "horímetro",
      finalHint:
        "Highscore salvo no navegador. Pressione um botão de ação para voltar ao menu.",
      instructionCards: {
        loadTitle: "Carregar",
        digTitle: "Cavar",
        greaseTitle: "Engraxar",
        brakeTitle: "Freio",
        loadDescription: (key: string) => `Use ${key} para carregar.`,
        digDescription: (key: string) => `Use ${key} para cavar.`,
        greaseDescription: (key: string) => `Use ${key} para aplicar graxa.`,
        brakeDescription: (key: string) => `Use ${key} para frear a máquina.`,
      },
      showcase: {
        pickup: (key: string) =>
          `Aproxime da pilha em 1ª marcha e use ${key} para operar a carregadeira na dianteira.`,
        dig: (key: string) =>
          `Use ${key} para operar a escavadeira na traseira e cavar ou preencher buracos.`,
        grease: (key: string) =>
          `Pare no ponto de manutenção e use ${key} para iniciar a graxa.`,
        traction: (key: string) =>
          `Use ${key} para frear e controlar a aproximação da máquina.`,
      },
      instructor: "INSTRUTOR",
      fnrLever: "Alavanca FNR",
      greaseSign: "GRAXA",
    },
    sounds: {
      engineStart: "Partida do motor",
      mud: "Lama",
      success: "Acerto",
      failure: "Erro",
    },
    aria: {
      canvas: "Fase 1 com a retroescavadeira controlada por FNR e marchas",
    },
    errors: {
      venezitoImages: "Falha ao carregar as imagens do Venezito.",
      carnauba: "Falha ao carregar a carnaúba da fase 1.",
      foreground: "Falha ao carregar o foreground da fase 1.",
      instructor: "Falha ao carregar o instrutor da fase 1.",
      pickupUnloadTruck:
        "Falha ao carregar o caminhão de descarregamento da fase 1.",
      sprite: (assetName: string) => `Falha ao carregar o sprite ${assetName}.`,
    },
    animation: {
      continuousDrive: "Rodagem contínua",
      questionPrompt: (keys: string) => `Use ${keys} para responder`,
    },
    messages: {
      loading: "Carregando fase 1...",
      hourmeterComplete: "Horímetro completo. Voltando para neutro e freando.",
      answerInstructorQuestion: "Responda a pergunta do instrutor.",
      outsideHitbox: "Fora da hitbox do evento.",
      wrongCommand: (eventTitle: string) =>
        `Comando incorreto para ${eventTitle.toLowerCase()}.`,
    },
  },
  phase2: {
    menuEyebrow: "Veneza Máquinas",
    menuTitle: "Preparo do plantio",
    menuDescription:
      "No campo, siga as etapas do preparo: grade, plantadeira e pulverizadora.",
    menuAction: "Jogar fase 2",
    preGameTitle: "Fase 2 - Preparo do plantio",
    preGameDescription:
      "Controle o trator com as setas ou WASD e prepare o campo com grade, plantadeira e pulverizadora.",
    preGameAction: "Começar (Enter)",
    preGameBack: "Voltar ao Menu",
    plowingTitle: "Fase 2 - Etapa da grade",
    plantingTitle: "Fase 2 - Plantadeira",
    caneTitle: "Fase 2 - Pulverizadora",
    movementHint: "WASD / setas movem o trator",
    plantedLabel: "Plantadas",
    caneLabel: "Cana",
    cellsLabel: "Células",
    timeLabel: "Tempo",
    progressLabel: "Progresso",
    initialMessage:
      "Passe a grade em todo o terreno passando por cima das células.",
    completeMessage: "Etapa da grade concluída em todo o campo.",
    readyToPlantMessage:
      "Grade concluída! Volte ao início para seguir para a plantadeira.",
    confirmPlantingMessage:
      "A segunda etapa vai começar. Pressione Space para confirmar.",
    plantingMessage: "Faça o preparo com a plantadeira em todo o campo.",
    plantingCompleteMessage:
      "Plantadeira concluída! Volte ao início para seguir para a pulverizadora.",
    readyToCaneMessage:
      "Plantadeira concluída! Volte ao início para iniciar a pulverização.",
    confirmCaneMessage:
      "A terceira etapa vai começar. Pressione Space para confirmar.",
    caneMessage: "Passe com a pulverizadora por todo o campo.",
    caneCompleteMessage:
      "Preparo concluído! Grade, plantadeira e pulverizadora finalizadas.",
    readyToRestartMessage:
      "Preparo concluído! Pressione espaço para reiniciar.",
    plantingProgress: (progress: number) => `Plantadeira: ${progress}%`,
    grassCutProgress: (progress: number) => `Grade: ${progress}%`,
    aria: {
      canvas:
        "Fase 2 com um trator em visão de cima no preparo do plantio com grade, plantadeira e pulverizadora",
    },
    errors: {
      vehicleSprites: "Falha ao carregar sprites do veículo da fase 2.",
    },
  },
} as const;
