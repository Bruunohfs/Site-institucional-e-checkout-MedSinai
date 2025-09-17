const defaultCheckoutUrl = "https://www.asaas.com/c/6hlzddkzblklkuoj";

export const planosMensais = [
    { 
      id: 1, 
      nome: "Individual", 
      descricao: "Perfeito para você",
      preco: "29,90",
      economia: "",
      beneficios: [
        "Todas as especialidades",
        "Consultas ilimitadas",
        "Sem cobranças extras",
        "Dependentes Inclusos", 
        "Medicos veterinarios",
        "Clube de vantagens"
      ],
      checkoutUrl: defaultCheckoutUrl 
    },
    { 
      id: 2, 
      nome: "Individual Plus", 
      descricao: "Individual + benefícios farmácia",
      preco: "49,90",
      valorPixFarma:"30,00",
      economia: "",
      beneficios: [
        "Tudo do Individual",
        "+ R$ 30 mensais Pix Farma",
      ],
      checkoutUrl: defaultCheckoutUrl 
    },
    { 
      id: 3, 
      nome: "Família", 
      descricao: "Para toda a família",
      preco: "59,90",
      economia: "",
      beneficios: [
        "Duas licenças Adulto",
        "Todas as especialidades",
        "Consultas ilimitadas",
        "Sem cobranças extras",
        "Dependentes Inclusos",
        "Medicos veterinarios",
        "Clube de vantagens"
      ],
      checkoutUrl: defaultCheckoutUrl 
    },
    { 
      id: 4, 
      nome: "Família Plus", 
      descricao: "Família + benefícios farmácia",
      preco: "89,90",
      valorPixFarma:"60,00",
      economia: "",
      beneficios: [
        "Tudo do Família",
        "+ R$ 60 mensais Pix Farma"
      ],
      checkoutUrl: defaultCheckoutUrl 
    }
  ]

export const planosAnuais = [
    { 
      id: 1, 
      nome: "Individual", 
      descricao: "Perfeito para você",
      preco: "24,90",
      parcelamento: "12x",
      economia: "Economize R$ 60/ano",
      beneficios: [
        "Todas as especialidades",
        "Consultas ilimitadas",
        "Sem cobranças extras",
        "Dependentes Inclusos", 
        "Medicos veterinarios",
        "Clube de vantagens"
      ],
      checkoutUrl: defaultCheckoutUrl 
    },
    { 
      id: 2, 
      nome: "Individual Plus", 
      descricao: "Individual + benefícios farmácia",
      preco: "39,90",
      valorPixFarma:"30,00",
      parcelamento: "12x",
      economia: "Economize R$ 120/ano",
      beneficios: [
        "Tudo do Individual",
        "R$ 30 mensais Pix Farma"
      ],
      checkoutUrl: defaultCheckoutUrl,
      destaque: true
    },
    { 
      id: 3, 
      nome: "Família", 
      descricao: "Para toda a família",
      preco: "49,90",
      parcelamento: "12x",
      economia: "Economize R$ 120/ano",
      beneficios: [
        "Duas licenças Adulto",
        "Todas as especialidades",
        "Consultas ilimitadas",
        "Sem cobranças extras",
        "Dependentes Inclusos",
        "Medicos Veterinarios",
        "Clube de vantagens"
      ],
      checkoutUrl: defaultCheckoutUrl 
    },
    { 
      id: 4, 
      nome: "Família Plus", 
      descricao: "Família + benefícios farmácia",
      preco: "79,90",
      valorPixFarma:"60,00",
      parcelamento: "12x",
      economia: "Economize R$ 120/ano",
      beneficios: [
        "Tudo do Família",
        "R$ 60 mensais Pix Farma",
      ],
      checkoutUrl: defaultCheckoutUrl 
    },
  ];
  export const todosOsPlanos = [...planosMensais, ...planosAnuais];
