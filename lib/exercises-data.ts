export interface Exercise {
  name: string
  category: string
  equipment: string
  instructions: string
  primaryMuscles: string[]
  secondaryMuscles: string[]
}

export const exercises: Exercise[] = [
  // Pecho
  {
    name: "Press de Banca",
    category: "Pecho",
    equipment: "Barra",
    instructions: "Acostarse en el banco, agarrar la barra un poco más ancho que los hombros, bajar al pecho, empujar hacia arriba",
    primaryMuscles: ["Pectorales"],
    secondaryMuscles: ["Tríceps", "Deltoides Anteriores"]
  },
  {
    name: "Press Inclinado",
    category: "Pecho",
    equipment: "Barra",
    instructions: "Ajustar banco a 30-45 grados, realizar movimiento de press de banca",
    primaryMuscles: ["Pectorales Superiores"],
    secondaryMuscles: ["Tríceps", "Deltoides Anteriores"]
  },
  {
    name: "Aperturas con Mancuernas",
    category: "Pecho",
    equipment: "Mancuernas",
    instructions: "Acostarse en banco, brazos abiertos, juntar mancuernas en movimiento de arco",
    primaryMuscles: ["Pectorales"],
    secondaryMuscles: ["Deltoides Anteriores"]
  },
  {
    name: "Flexiones",
    category: "Pecho",
    equipment: "Peso Corporal",
    instructions: "Comenzar en posición de plancha, bajar pecho al suelo, empujar hacia arriba",
    primaryMuscles: ["Pectorales"],
    secondaryMuscles: ["Tríceps", "Core"]
  },
  {
    name: "Fondos",
    category: "Pecho",
    equipment: "Barras Paralelas",
    instructions: "Sostener cuerpo en barras, bajar hasta hombros debajo de codos, empujar hacia arriba",
    primaryMuscles: ["Pectorales Inferiores"],
    secondaryMuscles: ["Tríceps", "Deltoides Anteriores"]
  },

  // Espalda
  {
    name: "Peso Muerto",
    category: "Espalda",
    equipment: "Barra",
    instructions: "Pararse con barra sobre pies, agarrar barra, levantar extendiendo caderas y rodillas",
    primaryMuscles: ["Erectores Espinales", "Dorsales"],
    secondaryMuscles: ["Glúteos", "Isquiotibiales", "Trapecios"]
  },
  {
    name: "Dominadas",
    category: "Espalda",
    equipment: "Barra de Dominadas",
    instructions: "Colgarse de la barra, tirar cuerpo hasta barbilla sobre barra, bajar con control",
    primaryMuscles: ["Dorsales"],
    secondaryMuscles: ["Bíceps", "Romboides"]
  },
  {
    name: "Remo con Barra",
    category: "Espalda",
    equipment: "Barra",
    instructions: "Inclinarse en caderas, agarrar barra, tirar hacia pecho inferior, apretar omóplatos",
    primaryMuscles: ["Dorsales", "Romboides"],
    secondaryMuscles: ["Bíceps", "Deltoides Posteriores"]
  },
  {
    name: "Jalón al Pecho",
    category: "Espalda",
    equipment: "Máquina de Cables",
    instructions: "Sentarse en máquina, tirar barra hacia pecho superior, apretar dorsales",
    primaryMuscles: ["Dorsales"],
    secondaryMuscles: ["Bíceps", "Romboides"]
  },
  {
    name: "Remo en T",
    category: "Espalda",
    equipment: "Barra en T",
    instructions: "Pararse sobre barra, inclinarse en caderas, tirar barra al pecho",
    primaryMuscles: ["Dorsales", "Romboides"],
    secondaryMuscles: ["Bíceps", "Deltoides Posteriores"]
  },

  // Piernas
  {
    name: "Sentadilla",
    category: "Piernas",
    equipment: "Barra",
    instructions: "Barra en espalda alta, pies ancho de hombros, sentadilla hacia abajo, empujar con talones",
    primaryMuscles: ["Cuádriceps", "Glúteos"],
    secondaryMuscles: ["Isquiotibiales", "Gemelos"]
  },
  {
    name: "Peso Muerto Rumano",
    category: "Piernas",
    equipment: "Barra",
    instructions: "Sostener barra, empujar caderas hacia atrás, bajar barra por piernas, volver a posición inicial",
    primaryMuscles: ["Isquiotibiales", "Glúteos"],
    secondaryMuscles: ["Erectores Espinales"]
  },
  {
    name: "Prensa de Piernas",
    category: "Piernas",
    equipment: "Máquina de Prensa",
    instructions: "Sentarse en máquina, pies en plataforma, bajar peso, empujar con talones",
    primaryMuscles: ["Cuádriceps", "Glúteos"],
    secondaryMuscles: ["Isquiotibiales"]
  },
  {
    name: "Estocadas",
    category: "Piernas",
    equipment: "Mancuernas",
    instructions: "Dar paso adelante, bajar rodilla trasera, empujar de vuelta a posición inicial",
    primaryMuscles: ["Cuádriceps", "Glúteos"],
    secondaryMuscles: ["Isquiotibiales", "Gemelos"]
  },
  {
    name: "Curl de Piernas",
    category: "Piernas",
    equipment: "Máquina",
    instructions: "Acostarse en máquina, flexionar talones hacia glúteos, bajar con control",
    primaryMuscles: ["Isquiotibiales"],
    secondaryMuscles: []
  },

  // Hombros
  {
    name: "Press Militar",
    category: "Hombros",
    equipment: "Barra",
    instructions: "Pararse con barra en hombros, empujar por encima de cabeza, bajar con control",
    primaryMuscles: ["Deltoides Anteriores"],
    secondaryMuscles: ["Tríceps", "Core"]
  },
  {
    name: "Elevaciones Laterales",
    category: "Hombros",
    equipment: "Mancuernas",
    instructions: "Sostener mancuernas a los lados, elevar brazos a altura de hombros, bajar lentamente",
    primaryMuscles: ["Deltoides Laterales"],
    secondaryMuscles: []
  },
  {
    name: "Aperturas Posteriores",
    category: "Hombros",
    equipment: "Mancuernas",
    instructions: "Inclinarse hacia adelante, brazos abiertos, llevar mancuernas hacia atrás en arco",
    primaryMuscles: ["Deltoides Posteriores"],
    secondaryMuscles: ["Romboides"]
  },
  {
    name: "Press Arnold",
    category: "Hombros",
    equipment: "Mancuernas",
    instructions: "Comenzar con palmas hacia vos, rotar y empujar por encima de cabeza",
    primaryMuscles: ["Deltoides"],
    secondaryMuscles: ["Tríceps"]
  },

  // Brazos
  {
    name: "Curl de Bíceps",
    category: "Brazos",
    equipment: "Mancuernas",
    instructions: "Sostener mancuernas, flexionar hacia arriba contrayendo bíceps, bajar lentamente",
    primaryMuscles: ["Bíceps"],
    secondaryMuscles: []
  },
  {
    name: "Fondos de Tríceps",
    category: "Brazos",
    equipment: "Banco",
    instructions: "Manos en banco detrás tuyo, bajar cuerpo, empujar hacia arriba",
    primaryMuscles: ["Tríceps"],
    secondaryMuscles: ["Deltoides Anteriores"]
  },
  {
    name: "Curl Martillo",
    category: "Brazos",
    equipment: "Mancuernas",
    instructions: "Sostener mancuernas con agarre neutro, flexionar hacia arriba, bajar lentamente",
    primaryMuscles: ["Bíceps", "Braquial"],
    secondaryMuscles: ["Antebrazos"]
  },
  {
    name: "Press Cerrado",
    category: "Brazos",
    equipment: "Barra",
    instructions: "Agarre estrecho en barra, bajar al pecho, empujar enfocándose en tríceps",
    primaryMuscles: ["Tríceps"],
    secondaryMuscles: ["Pectorales", "Deltoides Anteriores"]
  },

  // Core
  {
    name: "Plancha",
    category: "Core",
    equipment: "Peso Corporal",
    instructions: "Mantener posición de flexión, mantener cuerpo recto, contraer core",
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Hombros", "Glúteos"]
  },
  {
    name: "Giros Rusos",
    category: "Core",
    equipment: "Peso Corporal",
    instructions: "Sentarse con rodillas flexionadas, inclinarse hacia atrás, rotar torso de lado a lado",
    primaryMuscles: ["Oblicuos"],
    secondaryMuscles: ["Core"]
  },
  {
    name: "Bicho Muerto",
    category: "Core",
    equipment: "Peso Corporal",
    instructions: "Acostarse boca arriba, extender brazo y pierna opuestos, volver al inicio",
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Flexores de Cadera"]
  },
  {
    name: "Escaladores",
    category: "Core",
    equipment: "Peso Corporal",
    instructions: "Comenzar en plancha, alternar llevando rodillas al pecho rápidamente",
    primaryMuscles: ["Core"],
    secondaryMuscles: ["Hombros", "Flexores de Cadera"]
  }
]
