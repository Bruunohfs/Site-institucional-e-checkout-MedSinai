const defaultCheckoutUrl = "https://www.asaas.com/c/6hlzddkzblklkuoj";

export const planosMensais = [
    { 
      id: 1, 
      nome: "Individual", 
      descricao: "Perfeito para você",
      preco: "34,90",
      economia: "",
      beneficios: [
        "Todas as especialidades",
        "Consultas ilimitadas",
        "Sem cobranças extras",
        "Dependentes Inclusos", 
        "Veterinario para cães e gatos"
      ],
      checkoutUrl: defaultCheckoutUrl 
    },
    { 
      id: 2, 
      nome: "Individual Farma", 
      descricao: "Individual + benefícios farmácia",
      preco: "54,90",
      economia: "",
      beneficios: [
        "Tudo do Individual",
        "R$ 30 mensais Pix Farma",
        "Descontos em medicamentos",
        "Clube de vantagens"
      ],
      checkoutUrl: defaultCheckoutUrl 
    },
    { 
      id: 3, 
      nome: "Família", 
      descricao: "Para toda a família",
      preco: "69,90",
      economia: "",
      beneficios: [
        "Duas licenças Adulto",
        "Todas as especialidades",
        "Consultas ilimitadas",
        "Sem cobranças extras",
        "Dependentes Inclusos",
        "Veterinario para cães e gatos"
      ],
      checkoutUrl: defaultCheckoutUrl 
    },
    { 
      id: 4, 
      nome: "Família Farma", 
      descricao: "Família + benefícios farmácia",
      preco: "99,90",
      economia: "",
      beneficios: [
        "Tudo do Família",
        "R$ 60 mensais Pix Farma",
        "Descontos em medicamentos",
        "Clube de vantagens"
      ],
      checkoutUrl: defaultCheckoutUrl 
    }
  ]

export const planosAnuais = [
    { 
      id: 1, 
      nome: "Individual", 
      descricao: "Perfeito para você",
      preco: "25,90,",
      parcelamento: "12x de",
      economia: "Economize R$ 72/ano",
      beneficios: [
        "Todas as especialidades",
        "Consultas ilimitadas",
        "Sem cobranças extras",
        "Dependentes Inclusos", 
        "Veterinario para cães e gatos"
      ],
      checkoutUrl: defaultCheckoutUrl 
    },
    { 
      id: 2, 
      nome: "Individual Farma", 
      descricao: "Individual + benefícios farmácia",
      preco: "44,90",
      parcelamento: "12x de",
      economia: "Economize R$ 120/ano",
      beneficios: [
        "Tudo do Individual",
        "R$ 30 mensais Pix Farma",
        "Descontos em medicamentos",
        "Clube de vantagens"
      ],
      checkoutUrl: defaultCheckoutUrl,
      destaque: true
    },
    { 
      id: 3, 
      nome: "Família", 
      descricao: "Para toda a família",
      preco: "54,90",
      parcelamento: "12x de",
      economia: "Economize R$ 120/ano",
      beneficios: [
        "Duas licenças Adulto",
        "Todas as especialidades",
        "Consultas ilimitadas",
        "Sem cobranças extras",
        "Dependentes Inclusos",
        "Veterinario para cães e gatos"
      ],
      checkoutUrl: defaultCheckoutUrl 
    },
    { 
      id: 4, 
      nome: "Família Farma", 
      descricao: "Família + benefícios farmácia",
      preco: "79,90",
      parcelamento: "12x de",
      economia: "Economize R$ 240/ano",
      beneficios: [
        "Tudo do Família",
        "R$ 60 mensais Pix Farma",
        "Descontos em medicamentos",
        "Clube de vantagens"
      ],
      checkoutUrl: defaultCheckoutUrl 
    },
  ];
  export const todosOsPlanos = [...planosMensais, ...planosAnuais];